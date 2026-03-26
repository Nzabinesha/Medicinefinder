import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getPharmacy } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export function QuickOrder() {
  const { pharmacyId, medicineId } = useParams<{ pharmacyId: string; medicineId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [medicine, setMedicine] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const addToCart = useCartStore(s => s.add);
  const { user } = useAuthStore();

  const medicineName = searchParams.get('name') || '';

  useEffect(() => {
    if (!pharmacyId) {
      setError('Pharmacy ID is required');
      setLoading(false);
      return;
    }

    getPharmacy(pharmacyId).then(p => {
      if (!p) {
        setError('Pharmacy not found');
        setLoading(false);
        return;
      }

      setPharmacy(p);

      const medId = medicineId || medicineName;
      if (medId) {
        let foundMed = p.stocks.find((s: any) => s.id === medId);
        
        if (!foundMed && medicineName) {
          foundMed = p.stocks.find((s: any) => 
            s.name.toLowerCase().includes(medicineName.toLowerCase()) ||
            `${s.name} ${s.strength || ''}`.toLowerCase().includes(medicineName.toLowerCase())
          );
        }

        if (foundMed) {
          setMedicine(foundMed);
        } else {
          setError('Medicine not found in this pharmacy');
        }
      } else {
        setError('Medicine not specified');
      }

      setLoading(false);
    }).catch(err => {
      setError('Failed to load pharmacy details');
      setLoading(false);
    });
  }, [pharmacyId, medicineId, medicineName]);

  const handleAddToCart = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (user.role === 'pharmacy') {
      alert('Pharmacy accounts cannot place orders');
      return;
    }

    if (!medicine || !pharmacy) return;

    addToCart({
      pharmacyId: pharmacy.id,
      medicineId: medicine.id,
      name: `${medicine.name} ${medicine.strength || ''}`,
      priceRWF: medicine.priceRWF,
      quantity,
      requiresPrescription: medicine.requiresPrescription
    });

    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !pharmacy || !medicine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Medicine or pharmacy not found'}</p>
          <Link to="/pharmacies" className="btn-primary">
            Browse Pharmacies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Quick Order</h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Pharmacy</h2>
              <p className="text-gray-900">{pharmacy.name}</p>
              <p className="text-sm text-gray-600">{pharmacy.sector}</p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Medicine</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{medicine.name}</h3>
                  {medicine.strength && (
                    <p className="text-gray-600">Strength: {medicine.strength}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">
                    {medicine.priceRWF.toLocaleString()} RWF
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    medicine.quantity > 0 
                      ? 'bg-pharmacy-100 text-pharmacy-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {medicine.quantity > 0 ? `✓ ${medicine.quantity} in stock` : '✗ Out of stock'}
                  </span>
                </div>

                {medicine.requiresPrescription && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">⚠️ Prescription Required:</span> This medicine requires a valid prescription.
                    </p>
                  </div>
                )}

                {medicine.quantity > 0 && (
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Quantity:</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-primary-500 flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={medicine.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(medicine.quantity, Number(e.target.value) || 1)))}
                        className="w-20 border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:border-primary-500"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(medicine.quantity, quantity + 1))}
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 hover:border-primary-500 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">Total:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {(medicine.priceRWF * quantity).toLocaleString()} RWF
                    </span>
                  </div>
                  
                  {medicine.quantity > 0 ? (
                    <button
                      onClick={handleAddToCart}
                      className="w-full btn-primary"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full btn-primary opacity-50 cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

