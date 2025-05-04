'use client';

import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  cartId: string;
}

interface CheckoutFormProps {
  cart: Product[];
  onBack: () => void;
}

export default function CheckoutForm({ cart, onBack }: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    documento: '',
  });

  const total = cart.reduce((sum, product) => sum + product.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: cart,
          monto_total: total,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error en el checkout:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Resumen del Carrito</h3>
        {cart.map((item) => (
          <div key={item.cartId} className="flex justify-between mb-2">
            <span>{item.name}</span>
            <span>
              {new Intl.NumberFormat('es-PY', {
                style: 'currency',
                currency: 'PYG',
              }).format(item.price)}
            </span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>
              {new Intl.NumberFormat('es-PY', {
                style: 'currency',
                currency: 'PYG',
              }).format(total)}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Documento</label>
          <input
            type="text"
            name="documento"
            value={formData.documento}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Volver
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Pagar con PagoPar
          </button>
        </div>
      </form>
    </div>
  );
} 