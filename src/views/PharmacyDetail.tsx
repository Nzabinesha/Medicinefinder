import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getPharmacy } from '@/services/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { MapView } from '@/ui/MapView';

export function PharmacyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState<any>();
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore(s => s.add);
  const { user } = useAuthStore();
  const [qtyByMed, setQtyByMed] = useState<Record<string, number>>({});
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPharmacy(id).then(p => { setPharmacy(p as any); setLoading(false); });
  }, [id]);

  const handleAddToCart = (stock: any) => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (user.role === 'pharmacy') {
      alert('Pharmacy accounts cannot place orders. Please use a regular user account.');
      return;
    }

    addToCart({
      pharmacyId: pharmacy.id,
      medicineId: stock.id,
      name: `${stock.name} ${stock.strength}`,
      priceRWF: stock.priceRWF,
      quantity: qtyByMed[stock.id] ?? 1,
      requiresPrescription: stock.requiresPrescription
    });
    setAddedToCart(prev => ({ ...prev, [stock.id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [stock.id]: false })), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading pharmacy details...</p>
        </div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Pharmacy not found</h3>
        <p className="text-gray-600 mb-4">The pharmacy you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/pharmacies')} className="btn-primary">
          Browse Pharmacies
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <button 
            onClick={() => navigate('/pharmacies')}
            className="mb-4 text-white/90 hover:text-white flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{pharmacy.name}</h1>
          <p className="text-primary-100 text-lg">📍 {pharmacy.sector}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-0 overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-primary-400 to-pharmacy-400 relative">
                <img 
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=400&fit=crop&q=80" 
                  alt={pharmacy.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop&q=80';
                  }}
                />
                {pharmacy.delivery && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-pharmacy-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                      <span>🚚</span> Home Delivery Available
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏥</span> Insurance Accepted
              </h2>
              <div className="flex flex-wrap gap-3">
                {pharmacy.accepts.map((ins: string) => (
                  <span 
                    key={ins}
                    className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold text-sm"
                  >
                    {ins}
                  </span>
                ))}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>💊</span> Available Medicines
              </h2>
              
              {pharmacy.stocks.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No medicines available at this time.</p>
              ) : (
                <div className="space-y-4">
                  {pharmacy.stocks.map((s: any) => (
                    <div 
                      key={s.id} 
                      className="border-2 rounded-xl p-4 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{s.name}</h3>
                            <span className="text-sm text-gray-600">({s.strength})</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="font-semibold text-primary-600 text-lg">
                              {s.priceRWF.toLocaleString()} RWF
                            </span>
                            {s.requiresPrescription && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                📋 Prescription Required
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              s.quantity > 0 
                                ? 'bg-pharmacy-100 text-pharmacy-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {s.quantity > 0 ? `✓ ${s.quantity} in stock` : '✗ Out of stock'}
                            </span>
                          </div>
                        </div>
                        
                        {s.quantity > 0 && (
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min={1}
                              max={Math.max(1, s.quantity)}
                              value={qtyByMed[s.id] ?? 1}
                              onChange={(e) => setQtyByMed(prev => ({ 
                                ...prev, 
                                [s.id]: Math.max(1, Math.min(s.quantity, Number(e.target.value || 1))) 
                              }))}
                              className="w-20 border-2 border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:border-primary-500"
                            />
                            <button
                              onClick={() => handleAddToCart(s)}
                              className={`btn-primary px-6 py-2 ${addedToCart[s.id] ? 'bg-pharmacy-500' : ''}`}
                            >
                              {addedToCart[s.id] ? '✓ Added!' : 'Add to Cart'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-0 overflow-hidden">
              <div className="p-4 border-b bg-primary-50">
                <h3 className="font-semibold text-gray-900">📍 Location</h3>
              </div>
              <MapView 
                markers={[{ id: pharmacy.id, name: pharmacy.name, lat: pharmacy.lat, lng: pharmacy.lng }]} 
                height={300} 
              />
            </div>

            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/cart" 
                  className="block w-full btn-primary text-center"
                >
                  View Cart
                </Link>
                {pharmacy.phone && (
                  <a 
                    href={`tel:${pharmacy.phone}`}
                    className="block w-full btn-secondary text-center"
                  >
                    Call Pharmacy
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

