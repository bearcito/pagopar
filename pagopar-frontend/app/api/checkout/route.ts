import { NextResponse } from 'next/server';
import PagoPar from 'pagopar';

// Initialize PagoPar with your credentials
const pagopar = new PagoPar(
  process.env.PAGOPAR_PUBLIC_KEY || '',
  process.env.PAGOPAR_PRIVATE_KEY || '',
  {
    baseURL: process.env.PAGOPAR_API_URL || 'https://api.pagopar.com/api',
    version: '1.2',
  }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, documento, items, monto_total } = body;

    // Create transaction data
    const transactionData = {
      token_publico: process.env.PAGOPAR_PUBLIC_KEY,
      monto_total,
      tipo_pedido: 'venta_productos',
      fecha_maxima_pago: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      compras_items: items.map((item: any) => ({
        nombre: item.name,
        cantidad: 1,
        precio: item.price,
      })),
      comprador: {
        nombre,
        email,
        telefono,
        documento,
      },
    };

    // Create transaction
    const transaccion = await pagopar.crearTransaccion(transactionData);

    // Return the payment URL
    return NextResponse.json({
      url: transaccion.url_pago,
      token_transaccion: transaccion.token_transaccion,
    });
  } catch (error: any) {
    console.error('Error in checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Error en el proceso de pago' },
      { status: 500 }
    );
  }
} 