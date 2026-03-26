import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export function Notifications() {
  const { token } = useAuthStore();
  const [items, setItems] = useState<Array<{ id: number; title: string; message: string; read: number; created_at: string }>>([]);

  useEffect(() => {
    if (!token) return;
    getNotifications(token).then(setItems).catch(() => setItems([]));
  }, [token]);

  const markRead = async (id: number) => {
    if (!token) return;
    await markNotificationRead(token, id).catch(() => undefined);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: 1 } : n)));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="card py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Notifications</h1>
          <div className="space-y-3">
            {items.map((n) => (
              <div key={n.id} className={`border rounded-lg p-4 ${n.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{n.title}</p>
                    <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  {!n.read && (
                    <button className="btn-secondary text-sm" onClick={() => markRead(n.id)}>
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-gray-600">No notifications yet.</p>}
          </div>
          <div className="flex gap-4 justify-center mt-8">
            <Link to="/pharmacies" className="btn-primary">
              Continue Shopping
            </Link>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

