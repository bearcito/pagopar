# PagoPar API Integration

Módulo oficial de integración con la API de PagoPar para procesamiento de pagos y envíos.

## Características

- Integración completa con la API de PagoPar v1.2
- Soporte para pagos y envíos
- Validación de campos requeridos
- Manejo robusto de errores
- Logging configurable
- Timeout configurable
- Firma digital SHA-256 para seguridad

## Instalación

```bash
npm install pagopar
```

## Configuración Inicial

```javascript
const PagoPar = require("pagopar");

// Configuración básica
const pagopar = new PagoPar("TU_PUBLIC_KEY", "TU_PRIVATE_KEY");

// Configuración avanzada
const pagopar = new PagoPar("TU_PUBLIC_KEY", "TU_PRIVATE_KEY", {
  baseURL: "https://api.pagopar.com/api", // URL base de la API
  version: "1.2", // Versión de la API
  timeout: 10000, // Timeout en milisegundos
  logger: console, // Logger personalizado
});
```

## Métodos Disponibles

### Pagos

#### crearTransaccion(transactionData)

Crea una nueva transacción de pago.

```javascript
const transaccion = await pagopar.crearTransaccion({
  token_publico: "public_key",
  monto_total: 100000,
  tipo_pedido: "venta_productos",
  fecha_maxima_pago: new Date(),
  compras_items: [
    {
      nombre: "Producto 1",
      cantidad: 1,
      precio: 100000,
    },
  ],
  comprador: {
    nombre: "Juan Pérez",
    email: "juan@example.com",
    telefono: "0981123456",
    documento: "123456",
  },
});
```

#### consultarTransaccion(tokenTransaccion)

Consulta el estado de una transacción.

```javascript
const estado = await pagopar.consultarTransaccion("token_transaccion");
```

#### obtenerMediosPago()

Obtiene la lista de medios de pago disponibles.

```javascript
const mediosPago = await pagopar.obtenerMediosPago();
```

#### realizarReembolso(refundData)

Realiza un reembolso de una transacción.

```javascript
const reembolso = await pagopar.realizarReembolso({
  token_transaccion: "token_transaccion",
  monto: 50000,
});
```

### Envíos

#### crearEnvio(shippingData)

Crea un nuevo envío.

```javascript
const envio = await pagopar.crearEnvio({
  destinatario: "Juan Pérez",
  direccion: "Av. España 123",
  ciudad: "Asunción",
  telefono: "0981123456",
  email: "juan@example.com",
  productos: [
    {
      nombre: "Producto 1",
      cantidad: 1,
      precio: 100000,
    },
  ],
  monto_total: 100000,
  peso_total: 1.5,
});
```

#### consultarEstadoEnvio(codigoEnvio)

Consulta el estado de un envío.

```javascript
const estadoEnvio = await pagopar.consultarEstadoEnvio("codigo_envio");
```

#### obtenerCiudades()

Obtiene la lista de ciudades disponibles para envío.

```javascript
const ciudades = await pagopar.obtenerCiudades();
```

## Manejo de Errores

La biblioteca proporciona un manejo robusto de errores con mensajes descriptivos:

```javascript
try {
  const transaccion = await pagopar.crearTransaccion(data);
} catch (error) {
  if (error.code === "API_ERROR") {
    console.error("Error en la API:", error.message);
  } else if (error.code === "NETWORK_ERROR") {
    console.error("Error de conexión:", error.message);
  } else {
    console.error("Error de validación:", error.message);
  }
}
```

## Ejemplo de Implementación en E-commerce

```javascript
class EcommercePagoPar {
  constructor(publicKey, privateKey) {
    this.pagopar = new PagoPar(publicKey, privateKey, {
      logger: console,
      timeout: 15000,
    });
  }

  async procesarCompra(carrito, cliente, direccion) {
    try {
      // 1. Crear transacción de pago
      const transaccion = await this.pagopar.crearTransaccion({
        token_publico: this.pagopar.publicKey,
        monto_total: carrito.total,
        tipo_pedido: "venta_productos",
        fecha_maxima_pago: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        compras_items: carrito.productos.map((p) => ({
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio,
        })),
        comprador: {
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          documento: cliente.documento,
        },
      });

      // 2. Crear envío
      const envio = await this.pagopar.crearEnvio({
        destinatario: direccion.nombre,
        direccion: direccion.direccion,
        ciudad: direccion.ciudad,
        telefono: direccion.telefono,
        email: direccion.email,
        productos: carrito.productos,
        monto_total: carrito.total,
        peso_total: carrito.peso_total,
      });

      return {
        transaccion,
        envio,
      };
    } catch (error) {
      this.pagopar.logger.error("Error en el proceso de compra:", error);
      throw error;
    }
  }
}
```

## Webhooks

Implementa los siguientes endpoints para recibir notificaciones:

```javascript
// Webhook para notificaciones de pago
app.post("/webhook/pagopar/pago", async (req, res) => {
  const { token_transaccion, estado } = req.body;

  try {
    // Verificar la firma del webhook
    const signature = req.headers["x-pagopar-signature"];
    if (!this._verifyWebhookSignature(req.body, signature)) {
      return res.status(401).send("Firma inválida");
    }

    // Actualizar estado de la transacción
    await actualizarEstadoTransaccion(token_transaccion, estado);

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook:", error);
    res.status(500).send("Error interno");
  }
});

// Webhook para notificaciones de envío
app.post("/webhook/pagopar/envio", async (req, res) => {
  const { codigo_envio, estado } = req.body;

  try {
    // Verificar la firma del webhook
    const signature = req.headers["x-pagopar-signature"];
    if (!this._verifyWebhookSignature(req.body, signature)) {
      return res.status(401).send("Firma inválida");
    }

    // Actualizar estado del envío
    await actualizarEstadoEnvio(codigo_envio, estado);

    res.status(200).send("OK");
  } catch (error) {
    console.error("Error en webhook:", error);
    res.status(500).send("Error interno");
  }
});
```

## Consideraciones de Seguridad

1. **Validación de Datos**

   - Todos los campos requeridos son validados
   - Se verifica el formato de fechas
   - Se validan montos y cantidades

2. **Firma Digital**

   - Se utiliza SHA-256 para la firma
   - La firma incluye todos los datos de la transacción
   - Se verifica la firma en las respuestas

3. **Manejo de Errores**

   - Errores específicos por tipo
   - Logging configurable
   - Timeout configurable

4. **Protección de Datos**
   - No se almacenan datos sensibles
   - Se recomienda usar HTTPS
   - Implementar CSRF protection

## Soporte y Contacto

Para soporte técnico o consultas sobre la integración:

- Email: soporte@pagopar.com
- Teléfono: +595 21 123 456
- Documentación oficial: https://soporte.pagopar.com
