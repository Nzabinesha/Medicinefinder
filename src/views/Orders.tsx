import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getUserOrders, Order } from '@/services/api';

export function Orders() {
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userOrders = await getUserOrders(token);
        setOrders(userOrders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">View all your placed orders and their status</p>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="card bg-red-50 border-red-200 text-center py-12">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start by finding your medicine!
          </p>
          <Link to="/pharmacies" className="btn-primary">
            Find Medicine
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      Order #{order.id.slice(0, 12)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.prescriptionStatus && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.prescriptionStatus === 'approved' ? 'bg-green-100 text-green-700' :
                        order.prescriptionStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        Prescription: {order.prescriptionStatus}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Pharmacy:</span> {order.pharmacyName}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Phone:</span> {order.pharmacyPhone}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Address:</span> {order.pharmacyAddress}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Items:</h4>
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          • {item.name}{item.strength ? ` ${item.strength}` : ''} 
                          <span className="text-gray-500"> x{item.quantity}</span>
                          <span className="text-gray-600 font-semibold ml-2">
                            {item.total.toLocaleString()} RWF
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.delivery && order.deliveryAddress && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">🚚 Delivery Address:</span> {order.deliveryAddress}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      <span className="font-semibold">Placed:</span> {formatDate(order.createdAt)}
                    </span>
                    {order.updatedAt !== order.createdAt && (
                      <span>
                        <span className="font-semibold">Updated:</span> {formatDate(order.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:text-right">
                  <div className="mb-2">
                    <p className="text-2xl font-bold text-primary-600">
                      {order.totalRWF.toLocaleString()} RWF
                    </p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                  <Link
                    to={`/pharmacies/${order.pharmacyId}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    View Pharmacy →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

