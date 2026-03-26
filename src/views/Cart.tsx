import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';

export function Cart() {
  const { items, remove, total, setQuantity, clear } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="card text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Start adding medicines to your cart</p>
            <Link to="/pharmacies" className="btn-primary inline-block">
              Browse Pharmacies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="space-y-4 mb-6">
          {items.map((item, idx) => (
            <div key={idx} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.priceRWF.toLocaleString()} RWF each
                  </p>
                  {item.requiresPrescription && (
                    <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      📋 Prescription Required
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(item.pharmacyId, item.medicineId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-primary-500 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.pharmacyId, item.medicineId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-primary-500 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">
                      {(item.priceRWF * item.quantity).toLocaleString()} RWF
                    </p>
                  </div>
                  <button
                    onClick={() => remove(item.pharmacyId, item.medicineId)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card bg-primary-50 border-2 border-primary-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900">Total:</span>
            <span className="text-2xl font-bold text-primary-600">
              {total().toLocaleString()} RWF
            </span>
          </div>
          <div className="flex gap-3">
            <Link to="/prescription" className="flex-1 btn-primary text-center">
              Proceed to Checkout
            </Link>
            <button
              onClick={clear}
              className="btn-secondary"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

