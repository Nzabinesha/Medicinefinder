import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getInsuranceTypeOptions, getMedicineOptions, searchPharmacies } from '@/services/api';
import type { Pharmacy } from '@/services/data';
import { MapView } from '@/ui/MapView';

export function Pharmacies() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Pharmacy[]>([]);
  const [medicineQuery, setMedicineQuery] = useState(params.get('q') || '');
  const [searchLocation, setSearchLocation] = useState(params.get('loc') || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'insurance'>(
    params.get('insurance') ? 'insurance' : 'cash'
  );
  const [insuranceOptions, setInsuranceOptions] = useState<string[]>([]);
  const [medicineOptions, setMedicineOptions] = useState<string[]>([]);
  const [insuranceSelection, setInsuranceSelection] = useState(params.get('insurance') || '');
  const [formError, setFormError] = useState('');

  const queryParams = useMemo(() => ({
    q: params.get('q') || undefined,
    loc: params.get('loc') || undefined,
    insurance: params.get('insurance') || undefined,
  }), [params]);

  useEffect(() => {
    setLoading(true);
    searchPharmacies(queryParams).then(res => {
      setItems(res);
      setLoading(false);
    });
  }, [queryParams]);

  useEffect(() => {
    getMedicineOptions().then((meds) => {
      setMedicineOptions(meds);
    });
    getInsuranceTypeOptions().then(setInsuranceOptions);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (paymentMethod === 'insurance' && !insuranceSelection) {
      setFormError('Please select an insurance type.');
      return;
    }

    const newParams = new URLSearchParams();
    if (medicineQuery) newParams.set('q', medicineQuery);
    if (searchLocation) newParams.set('loc', searchLocation);
    if (paymentMethod === 'insurance' && insuranceSelection) {
      newParams.set('insurance', insuranceSelection);
    }
    setParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Medicine Finder</h1>
          {formError && (
            <div className="mb-4 max-w-5xl">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            </div>
          )}
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl">
            <select
              value={medicineQuery}
              onChange={(e) => setMedicineQuery(e.target.value)}
              className="input-field text-gray-900"
            >
              <option value="">Select medicine</option>
              {medicineOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <input
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="input-field text-gray-900"
              placeholder="Location (e.g., Kacyiru)"
            />
            <select
              value={paymentMethod}
              onChange={(e) => {
                const v = e.target.value as 'cash' | 'insurance';
                setPaymentMethod(v);
                if (v === 'cash') setInsuranceSelection('');
              }}
              className="input-field text-gray-900"
            >
              <option value="cash">Pay by Cash</option>
              <option value="insurance">Pay by Insurance</option>
            </select>
            <button type="submit" className="btn-primary bg-white text-primary-700 hover:bg-primary-50">
              Search
            </button>
            {paymentMethod === 'insurance' && (
              <select
                value={insuranceSelection}
                onChange={(e) => setInsuranceSelection(e.target.value)}
                className="input-field text-gray-900 md:col-span-2"
              >
                <option value="">Select insurance</option>
                {insuranceOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-gray-600">
            Found <span className="font-semibold text-primary-600">{items.length}</span> {items.length === 1 ? 'pharmacy' : 'pharmacies'}
            {queryParams.q && ` with "${queryParams.q}"`}
            {queryParams.loc && ` in ${queryParams.loc}`}
          </div>
        )}

        {/* Map View */}
        {items.length > 0 && (
          <div className="mb-8">
            <div className="card p-0 overflow-hidden">
              <div className="p-4 border-b bg-primary-50">
                <h3 className="font-semibold text-gray-900">📍 Pharmacy Locations</h3>
              </div>
              <MapView markers={items.map(p => ({ id: p.id, name: p.name, lat: p.lat, lng: p.lng }))} height={400} />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Searching pharmacies...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pharmacies found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
            <button 
              onClick={() => navigate('/')} 
              className="btn-primary"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items
              .filter(p => {
                if (queryParams.q) {
                  const matchingMedicines = p.stocks.filter(s => 
                    s.name.toLowerCase().includes((queryParams.q || '').toLowerCase())
                  );
                  return matchingMedicines.some(m => m.quantity > 0);
                }
                return true;
              })
              .map((p) => {
              const matchingMedicines = queryParams.q 
                ? p.stocks.filter(s => s.name.toLowerCase().includes((queryParams.q || '').toLowerCase()))
                : [];
              const hasStock = matchingMedicines.some(m => m.quantity > 0);

              return (
                <div key={p.id} className="card hover:shadow-2xl transition-all duration-200">
                  {/* Pharmacy Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-400 to-pharmacy-400 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop&q=80" 
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-3 right-3">
                      {p.delivery && (
                        <span className="bg-pharmacy-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                          🚚 Delivery
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pharmacy Info */}
                  <div className="space-y-3">
                    <div>
                      <Link to={`/pharmacies/${p.id}`} className="text-xl font-bold text-primary-700 hover:text-primary-800 transition-colors">
                        {p.name}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">📍 {p.sector}</p>
                    </div>

                    {/* Insurance Badges */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Insurance Accepted:</p>
                      <div className="flex flex-wrap gap-2">
                        {p.accepts.map((ins) => (
                          <span 
                            key={ins} 
                            className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium"
                          >
                            {ins}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Medicine Availability */}
                    {queryParams.q && matchingMedicines.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Medicine Available:</p>
                        <div className="space-y-2">
                          {matchingMedicines.filter(m => m.quantity > 0).map((med) => (
                            <div key={med.id} className="space-y-2 p-2 bg-pharmacy-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-gray-900 text-sm">{med.name} {med.strength}</span>
                                  <p className="text-xs text-primary-600 font-semibold mt-1">
                                    {med.priceRWF.toLocaleString()} RWF
                                  </p>
                                </div>
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-pharmacy-100 text-pharmacy-700">
                                  ✓ {med.quantity} in stock
                                </span>
                              </div>
                              <Link
                                to={`/order/${p.id}/${med.id}?name=${encodeURIComponent(med.name)}`}
                                className="block w-full btn-primary text-center text-sm py-2"
                              >
                                Order Now →
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {!queryParams.q && (
                        <Link 
                          to={`/pharmacies/${p.id}`} 
                          className="flex-1 btn-primary text-center text-sm py-2"
                        >
                          View All Medicines
                        </Link>
                      )}
                      {queryParams.q && !hasStock && (
                        <Link 
                          to={`/pharmacies/${p.id}`} 
                          className="flex-1 btn-secondary text-center text-sm py-2 border-primary-600 text-primary-600 hover:bg-primary-50"
                        >
                          View Other Medicines
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

