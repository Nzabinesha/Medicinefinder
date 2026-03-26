import { useEffect, useState } from 'react';
import { adminCreatePharmacy, adminDeletePharmacy, adminListPharmacies } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function AdminDashboard() {
  const token = useAuthStore((s) => s.token);
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pharmacies, setPharmacies] = useState<Array<{ id: string; name: string; sector: string; phone?: string; login_email?: string }>>([]);
  const [createdCreds, setCreatedCreds] = useState<{ loginEmail?: string; loginPassword?: string } | null>(null);

  const loadPharmacies = async () => {
    if (!token) return;
    try {
      const rows = await adminListPharmacies(token);
      setPharmacies(rows);
    } catch {
      // ignore, surfaced elsewhere
    }
  };

  useEffect(() => {
    loadPharmacies();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!token) {
      setError('Missing auth token. Please login again.');
      return;
    }
    setLoading(true);
    try {
      const parsedLat = lat.trim() === '' ? undefined : Number(lat);
      const parsedLng = lng.trim() === '' ? undefined : Number(lng);
      if (parsedLat !== undefined && Number.isNaN(parsedLat)) throw new Error('Latitude must be a number');
      if (parsedLng !== undefined && Number.isNaN(parsedLng)) throw new Error('Longitude must be a number');

      const res = await adminCreatePharmacy(token, {
        name,
        sector,
        phone: phone || undefined,
        address: address || undefined,
        delivery,
        lat: parsedLat,
        lng: parsedLng,
        loginEmail,
        loginPassword,
      });
      setSuccess(`Pharmacy created: ${res.id}`);
      setCreatedCreds({ loginEmail: res.loginEmail || loginEmail, loginPassword: res.loginPassword || loginPassword });
      setName('');
      setSector('');
      setPhone('');
      setAddress('');
      setLat('');
      setLng('');
      setLoginEmail('');
      setLoginPassword('');
      setDelivery(false);
      loadPharmacies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pharmacy');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Delete this pharmacy and disable access immediately?')) return;
    try {
      await adminDeletePharmacy(token, id);
      await loadPharmacies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete pharmacy');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin</h1>
        <p className="text-gray-600 mb-8">Create and manage pharmacies.</p>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Pharmacy</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}
          {createdCreds && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
              <p className="font-semibold mb-1">Share these pharmacy credentials with tester:</p>
              <p>Email: {createdCreds.loginEmail}</p>
              <p>Password: {createdCreds.loginPassword}</p>
              <p className="mt-1 text-xs text-blue-700">Automatic email sending is not configured yet; copy and send manually.</p>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                <input className="input-field" value={sector} onChange={(e) => setSector(e.target.value)} required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pharmacy Login Email</label>
                <input type="email" className="input-field" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pharmacy Login Password</label>
                <input type="text" className="input-field" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone (optional)</label>
                <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address (optional)</label>
                <input className="input-field" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude (optional)</label>
                <input
                  className="input-field"
                  inputMode="decimal"
                  placeholder="-1.9447"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude (optional)</label>
                <input
                  className="input-field"
                  inputMode="decimal"
                  placeholder="30.0614"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} />
              Delivery available
            </label>

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Pharmacy'}
            </button>
          </form>
        </div>

        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Pharmacies</h2>
          <div className="space-y-3">
            {pharmacies.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.sector} {p.login_email ? `• ${p.login_email}` : ''}</p>
                </div>
                <button onClick={() => handleDelete(p.id)} className="btn-secondary border-red-500 text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            ))}
            {pharmacies.length === 0 && <p className="text-sm text-gray-600">No pharmacies found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

