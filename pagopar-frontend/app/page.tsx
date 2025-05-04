'use client';

import { useState } from 'react';
import ProductList from './components/ProductList';
import CheckoutForm from './components/CheckoutForm';

export default function Home() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [cart, setCart] = useState([]);

  const products = [
    {
      id: 1,
      name: 'Producto 1',
      price: 100000,
      description: 'Descripción del producto 1',
    },
    {
      id: 2,
      name: 'Producto 2',
      price: 150000,
      description: 'Descripción del producto 2',
    },
    {
      id: 3,
      name: 'Producto 3',
      price: 200000,
      description: 'Descripción del producto 3',
    },
  ];

  const addToCart = (product) => {
    setCart([...cart, { ...product, cartId: Date.now() + Math.random() }]);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Tienda PagoPar</h1>
        
        {!showCheckout ? (
          <>
            <div className="mb-4">
              <button
                onClick={() => setShowCheckout(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={cart.length === 0}
              >
                Ir al Checkout ({cart.length} items)
              </button>
            </div>
            <ProductList products={products} onAddToCart={addToCart} />
          </>
        ) : (
          <CheckoutForm cart={cart} onBack={() => setShowCheckout(false)} />
        )}
      </div>
    </main>
  );
}
