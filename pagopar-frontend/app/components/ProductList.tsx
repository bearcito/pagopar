'use client';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductList({ products, onAddToCart }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">
              {new Intl.NumberFormat('es-PY', {
                style: 'currency',
                currency: 'PYG',
              }).format(product.price)}
            </span>
            <button
              onClick={() => onAddToCart(product)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 