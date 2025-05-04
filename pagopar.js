/**
 * Módulo oficial de integración con la API de PagoPar
 * Documentación oficial: https://soporte.pagopar.com/portal/es/kb/articles/api-integracion-medios-pagos
 * @version 2.0.0
 */

const axios = require('axios');
const crypto = require('crypto');

class PagoPar {
  constructor(publicKey, privateKey, config = {}) {
    if (!publicKey || !privateKey) {
      throw new Error('Claves pública y privada son requeridas');
    }

    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.baseURL = config.baseURL || 'https://api.pagopar.com/api';
    this.version = config.version || '1.2';
    this.timeout = config.timeout || 10000;
    this.logger = config.logger || console;
  }

  /**
   * Crea una transacción de pago
   * @param {Object} transactionData - Datos de la transacción
   * @returns {Promise<Object>} Respuesta de la API
   */
  async crearTransaccion(transactionData) {
    const requiredFields = [
      'token_publico', 'monto_total', 'tipo_pedido', 
      'fecha_maxima_pago', 'compras_items', 'comprador'
    ];

    this._validateFields(transactionData, requiredFields);

    const endpoint = '/pedidos/crear/';
    const data = {
      ...transactionData,
      token: this.publicKey,
      fecha_maxima_pago: this._formatDate(transactionData.fecha_maxima_pago)
    };

    return this._makeRequest(endpoint, data);
  }

  /**
   * Consulta el estado de una transacción
   * @param {string} tokenTransaccion - Token de la transacción
   * @returns {Promise<Object>} Estado de la transacción
   */
  async consultarTransaccion(tokenTransaccion) {
    if (!tokenTransaccion) {
      throw new Error('Token de transacción es requerido');
    }

    const endpoint = '/pedidos/traer/';
    const data = {
      token: this.publicKey,
      token_transaccion: tokenTransaccion
    };

    return this._makeRequest(endpoint, data);
  }

  /**
   * Obtiene los medios de pago disponibles
   * @returns {Promise<Object>} Lista de medios de pago
   */
  async obtenerMediosPago() {
    const endpoint = '/medios-de-pago/lista/';
    const data = { token: this.publicKey };
    return this._makeRequest(endpoint, data);
  }

  /**
   * Realiza un reembolso
   * @param {Object} refundData - Datos del reembolso
   * @returns {Promise<Object>} Respuesta del reembolso
   */
  async realizarReembolso(refundData) {
    const requiredFields = ['token_transaccion', 'monto'];
    this._validateFields(refundData, requiredFields);

    const endpoint = '/reembolsos/crear/';
    const data = {
      token: this.publicKey,
      ...refundData
    };

    return this._makeRequest(endpoint, data);
  }

  /**
   * Crea un envío
   * @param {Object} shippingData - Datos del envío
   * @returns {Promise<Object>} Respuesta del envío
   */
  async crearEnvio(shippingData) {
    const requiredFields = [
      'destinatario', 'direccion', 'ciudad', 
      'telefono', 'email', 'productos', 
      'monto_total', 'peso_total'
    ];

    this._validateFields(shippingData, requiredFields);

    const endpoint = '/envios/crear/';
    const data = {
      token: this.publicKey,
      ...shippingData
    };

    return this._makeRequest(endpoint, data);
  }

  /**
   * Consulta el estado de un envío
   * @param {string} codigoEnvio - Código del envío
   * @returns {Promise<Object>} Estado del envío
   */
  async consultarEstadoEnvio(codigoEnvio) {
    if (!codigoEnvio) {
      throw new Error('Código de envío es requerido');
    }

    const endpoint = '/envios/estado/';
    const data = {
      token: this.publicKey,
      codigo_envio: codigoEnvio
    };

    return this._makeRequest(endpoint, data);
  }

  /**
   * Obtiene las ciudades disponibles para envío
   * @returns {Promise<Object>} Lista de ciudades
   */
  async obtenerCiudades() {
    const endpoint = '/ciudades/lista/';
    const data = { token: this.publicKey };
    return this._makeRequest(endpoint, data);
  }

  // Métodos auxiliares privados

  _validateFields(data, requiredFields) {
    requiredFields.forEach(field => {
      if (!data[field]) {
        throw new Error(`El campo ${field} es requerido`);
      }
    });
  }

  _formatDate(date) {
    if (date instanceof Date) {
      return date.toISOString();
    }
    return new Date(date).toISOString();
  }

  _generateSignature(data) {
    const dataString = typeof data === 'object' 
      ? JSON.stringify(data) 
      : data.toString();
    
    return crypto
      .createHash('sha256')
      .update(`${this.privateKey}${dataString}`)
      .digest('hex');
  }

  async _makeRequest(endpoint, data) {
    const url = `${this.baseURL}/${this.version}${endpoint}`;
    const signature = this._generateSignature(data);

    try {
      const response = await axios.post(url, {
        ...data,
        firma: signature
      }, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.logger.debug(`PagoPar API Response: ${url}`, response.data);
      return response.data;
    } catch (error) {
      this.logger.error(`PagoPar API Error: ${url}`, error.response?.data || error.message);
      throw this._formatError(error);
    }
  }

  _formatError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        code: error.response.data?.codigo || 'API_ERROR',
        message: error.response.data?.mensaje || 'Error en la API PagoPar',
        data: error.response.data
      };
    }
    return {
      code: 'NETWORK_ERROR',
      message: error.message || 'Error de conexión con PagoPar'
    };
  }
}

module.exports = PagoPar;