import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  getPharmacyStock,
  addStock,
  updateStock,
  deleteStock,
  getAllMedicines,
  getPharmacyOrders,
  getOrderDetails,
  updateOrderStatus,
  updatePrescriptionStatus,
  updatePaymentStatus,
  updateInsuranceStatus,
  getPharmacyInsurance,
  getAllInsuranceTypes,
  addInsurancePartner,
  removeInsurancePartner,
} from '@/services/dashboardApi';

function PrescriptionViewer({ prescriptionFile, prescriptionStatus, orderId, onUpdatePrescription }: {
  prescriptionFile: string;
  prescriptionStatus?: string | null;
  orderId: string;
  onUpdatePrescription: (orderId: string, status: string) => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  // Check if it's a PDF or image
  const isPDF = prescriptionFile.startsWith('data:application/pdf') || 
                prescriptionFile.includes('application/pdf');
  const isImage = !isPDF;

  const handleOpenFullscreen = () => {
    setIsFullscreen(true);
    setZoom(1);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">Prescription</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            prescriptionStatus === 'approved' ? 'bg-pharmacy-100 text-pharmacy-700' :
            prescriptionStatus === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            Status: {prescriptionStatus || 'pending'}
          </span>
        </div>
        {prescriptionStatus !== 'approved' && (
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => {
                onUpdatePrescription(orderId, 'approved');
              }}
              className="btn-primary bg-pharmacy-600 hover:bg-pharmacy-700 text-sm py-2"
            >
              ✓ Approve Prescription
            </button>
            <button
              onClick={() => {
                onUpdatePrescription(orderId, 'rejected');
              }}
              className="btn-secondary text-sm py-2 border-red-600 text-red-600 hover:bg-red-50"
            >
              ✗ Reject Prescription
            </button>
          </div>
        )}
        
        {/* Prescription Display */}
        <div className="mt-3 border rounded-lg bg-white overflow-hidden">
          <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-200 rounded"
                title="Zoom Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-200 rounded"
                title="Zoom In"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 hover:bg-gray-200 rounded text-sm"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
            <button
              onClick={handleOpenFullscreen}
              className="p-1 hover:bg-gray-200 rounded"
              title="View Fullscreen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
          
          <div className="overflow-auto max-h-96 p-4 bg-gray-50" style={{ maxHeight: '400px' }}>
            {isPDF ? (
              <iframe
                src={prescriptionFile}
                className="w-full border-0"
                style={{ 
                  height: `${400 * zoom}px`,
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  width: `${100 / zoom}%`
                }}
                title="Prescription PDF"
              />
            ) : (
              <div className="flex justify-center">
                <img 
                  src={prescriptionFile} 
                  alt="Prescription" 
                  className="rounded border shadow-sm"
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
            <h3 className="text-lg font-semibold">Prescription Viewer</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-700 rounded"
                  title="Zoom Out"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                  </svg>
                </button>
                <span className="text-sm font-medium min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-700 rounded"
                  title="Zoom In"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-3 py-1 hover:bg-gray-700 rounded text-sm"
                  title="Reset Zoom"
                >
                  Reset
                </button>
              </div>
              <button
                onClick={handleCloseFullscreen}
                className="p-2 hover:bg-gray-700 rounded"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            {isPDF ? (
              <iframe
                src={prescriptionFile}
                className="w-full h-full border-0"
                style={{ 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  width: `${100 / zoom}%`,
                  height: `${100 / zoom}%`
                }}
                title="Prescription PDF"
              />
            ) : (
              <img 
                src={prescriptionFile} 
                alt="Prescription" 
                className="max-w-full max-h-full rounded shadow-2xl"
                style={{ 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center'
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type Tab = 'stock' | 'orders' | 'insurance';

export function PharmacyDashboard() {
  const { user, token } = useAuthStore();
  const [stock, setStock] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [insurance, setInsurance] = useState<any[]>([]);
  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [allInsuranceTypes, setAllInsuranceTypes] = useState<any[]>([]);
  const [pharmacyInfo, setPharmacyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('stock');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  // Stock management modals
  const [showAddStock, setShowAddStock] = useState(false);
  const [showEditStock, setShowEditStock] = useState<any>(null);
  const [newStock, setNewStock] = useState({ medicineId: '', quantity: '', priceRWF: '' });

  // Insurance management
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [selectedInsuranceId, setSelectedInsuranceId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  useEffect(() => {
    if (token && user) {
      loadData();
    }
  }, [token, user]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [stockData, ordersData, insuranceData, medicinesData, insuranceTypesData] = await Promise.all([
        getPharmacyStock(token).catch(() => []),
        getPharmacyOrders(token).catch(() => []),
        getPharmacyInsurance(token).catch(() => []),
        getAllMedicines(token).catch(() => []),
        getAllInsuranceTypes(token).catch(() => [])
      ]);
      setStock(stockData);
      setOrders(ordersData);
      setInsurance(insuranceData);
      setAllMedicines(medicinesData);
      setAllInsuranceTypes(insuranceTypesData);
      
      // Get pharmacy info from first stock item or orders
      if (stockData.length > 0 || ordersData.length > 0) {
        // Pharmacy info will be available through the API
        setPharmacyInfo({ name: user?.name || 'Your Pharmacy' });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await addStock(
        parseInt(newStock.medicineId),
        parseInt(newStock.quantity),
        parseFloat(newStock.priceRWF),
        token
      );
      setShowAddStock(false);
      setNewStock({ medicineId: '', quantity: '', priceRWF: '' });
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add stock');
    }
  };

  const handleUpdateStock = async (medicineId: number, quantity: number, priceRWF: number) => {
    if (!token) return;
    try {
      await updateStock(medicineId, quantity, priceRWF, token);
      setShowEditStock(null);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update stock');
    }
  };

  const handleDeleteStock = async (medicineId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to remove this medicine from your stock?')) return;
    try {
      await deleteStock(medicineId, token);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete stock');
    }
  };

  const handleAddInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await addInsurancePartner(parseInt(selectedInsuranceId), token);
      setShowAddInsurance(false);
      setSelectedInsuranceId('');
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add insurance partner');
    }
  };

  const handleRemoveInsurance = async (insuranceId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to remove this insurance partner?')) return;
    try {
      await removeInsurancePartner(insuranceId, token);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove insurance partner');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (!token) return;
    try {
      await updateOrderStatus(orderId, status, token);
      loadData();
      if (selectedOrder?.id === orderId) {
        const updated = await getOrderDetails(orderId, token);
        setSelectedOrder(updated);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const handleUpdatePrescriptionStatus = async (orderId: string, prescriptionStatus: string) => {
    if (!token) return;
    try {
      await updatePrescriptionStatus(orderId, prescriptionStatus, token);
      loadData();
      if (selectedOrder?.id === orderId) {
        const updated = await getOrderDetails(orderId, token);
        setSelectedOrder(updated);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update prescription status');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    if (!token) return;
    try {
      await updatePaymentStatus(orderId, paymentStatus, token);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update payment status');
    }
  };

  const handleUpdateInsuranceStatus = async (orderId: string, insuranceStatus: string, coveragePercent: number | null) => {
    if (!token) return;
    try {
      await updateInsuranceStatus(orderId, insuranceStatus, coveragePercent, token);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update insurance status');
    }
  };

  const viewOrderDetails = async (orderId: string) => {
    if (!token) return;
    try {
      const details = await getOrderDetails(orderId, token);
      setSelectedOrder(details);
    } catch (error) {
      alert('Failed to load order details');
    }
  };

  const availableMedicines = allMedicines.filter(m => 
    !stock.some(s => s.medicineId === m.id)
  );

  const availableInsurance = allInsuranceTypes.filter(ins =>
    !insurance.some(i => i.id === ins.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pharmacy-600 to-pharmacy-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">🏥 Pharmacy Dashboard</h1>
          <p className="text-pharmacy-100">
            {pharmacyInfo?.name || user?.name || 'Manage your pharmacy operations'}
          </p>
          {user?.email && (
            <p className="text-pharmacy-200 text-sm mt-1">Logged in as: {user.email}</p>
          )}
          <div className="mt-3 flex gap-2">
            <input
              type="password"
              placeholder="Current password"
              className="input-field text-gray-900 max-w-xs"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New password"
              className="input-field text-gray-900 max-w-xs"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              className="btn-secondary bg-white text-pharmacy-700"
              onClick={async () => {
                try {
                  if (!token) return;
                  const { changePassword } = await import('@/services/api');
                  await changePassword(token, currentPassword, newPassword);
                  setCurrentPassword('');
                  setNewPassword('');
                  alert('Password updated');
                } catch (e) {
                  alert(e instanceof Error ? e.message : 'Failed to change password');
                }
              }}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'stock'
                  ? 'border-pharmacy-600 text-pharmacy-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              💊 Stock Management
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-pharmacy-600 text-pharmacy-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📦 Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('insurance')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'insurance'
                  ? 'border-pharmacy-600 text-pharmacy-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🏥 Insurance Partners
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pharmacy-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : activeTab === 'stock' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Medicine Stock</h2>
              <button
                onClick={() => setShowAddStock(true)}
                className="btn-primary bg-pharmacy-600 hover:bg-pharmacy-700"
              >
                + Add Medicine
              </button>
            </div>

            {stock.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 mb-4">No stock available. Add your first medicine to get started.</p>
                <button
                  onClick={() => setShowAddStock(true)}
                  className="btn-primary bg-pharmacy-600 hover:bg-pharmacy-700"
                >
                  Add Medicine
                </button>
              </div>
            ) : (
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Medicine</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Quantity</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Price (RWF)</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock.map((item: any) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              {item.strength && (
                                <p className="text-sm text-gray-600">{item.strength}</p>
                              )}
                              {item.requiresPrescription && (
                                <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                  📋 Prescription Required
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-semibold ${
                              item.quantity > 0 ? 'text-pharmacy-600' : 'text-red-600'
                            }`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-primary-600">
                              {item.priceRWF?.toLocaleString()} RWF
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowEditStock(item)}
                                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteStock(item.medicineId)}
                                className="text-red-600 hover:text-red-700 font-medium text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
            
            {orders.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600">No orders yet. Orders will appear here when customers place them.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'completed' ? 'bg-pharmacy-100 text-pharmacy-700' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                          {order.prescriptionStatus && (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.prescriptionStatus === 'approved' ? 'bg-pharmacy-100 text-pharmacy-700' :
                              order.prescriptionStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              Prescription: {order.prescriptionStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 font-medium mb-1">{order.customerName}</p>
                        {order.customerEmail && (
                          <p className="text-sm text-gray-600">{order.customerEmail}</p>
                        )}
                        {order.customerPhone && (
                          <p className="text-sm text-gray-600">{order.customerPhone}</p>
                        )}
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {order.items?.join(', ') || 'No items'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                        {order.delivery && order.address && (
                          <p className="text-sm text-gray-600 mt-2">
                            🚚 Delivery to: {order.address}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-xl font-bold text-primary-600 mb-4">
                          {order.total?.toLocaleString()} RWF
                        </p>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => viewOrderDetails(order.id)}
                            className="btn-secondary text-sm py-2 px-4"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Insurance Partners</h2>
              <button
                onClick={() => setShowAddInsurance(true)}
                className="btn-primary bg-pharmacy-600 hover:bg-pharmacy-700"
                disabled={availableInsurance.length === 0}
              >
                + Add Insurance Partner
              </button>
            </div>

            {insurance.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 mb-4">No insurance partners added yet.</p>
                <button
                  onClick={() => setShowAddInsurance(true)}
                  className="btn-primary bg-pharmacy-600 hover:bg-pharmacy-700"
                  disabled={availableInsurance.length === 0}
                >
                  Add Insurance Partner
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insurance.map((ins: any) => (
                  <div key={ins.id} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ins.name}</h3>
                      </div>
                      <button
                        onClick={() => handleRemoveInsurance(ins.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddStock && (
        <Modal onClose={() => setShowAddStock(false)}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Medicine to Stock</h2>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine
              </label>
              <select
                value={newStock.medicineId}
                onChange={(e) => setNewStock({ ...newStock, medicineId: e.target.value })}
                required
                className="input-field"
              >
                <option value="">Select a medicine</option>
                {availableMedicines.map((med: any) => (
                  <option key={med.id} value={med.id}>
                    {med.name} {med.strength || ''} {med.requiresPrescription ? '(Prescription Required)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="0"
                value={newStock.quantity}
                onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                required
                className="input-field"
                placeholder="Enter quantity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (RWF)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newStock.priceRWF}
                onChange={(e) => setNewStock({ ...newStock, priceRWF: e.target.value })}
                required
                className="input-field"
                placeholder="Enter price in RWF"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 btn-primary bg-pharmacy-600 hover:bg-pharmacy-700">
                Add Medicine
              </button>
              <button
                type="button"
                onClick={() => setShowAddStock(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Stock Modal */}
      {showEditStock && (
        <EditStockModal
          stock={showEditStock}
          onClose={() => setShowEditStock(null)}
          onSave={handleUpdateStock}
        />
      )}

      {/* Add Insurance Modal */}
      {showAddInsurance && (
        <Modal onClose={() => setShowAddInsurance(false)}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Insurance Partner</h2>
          <form onSubmit={handleAddInsurance} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Type
              </label>
              <select
                value={selectedInsuranceId}
                onChange={(e) => setSelectedInsuranceId(e.target.value)}
                required
                className="input-field"
              >
                <option value="">Select insurance type</option>
                {availableInsurance.map((ins: any) => (
                  <option key={ins.id} value={ins.id}>
                    {ins.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 btn-primary bg-pharmacy-600 hover:bg-pharmacy-700">
                Add Insurance
              </button>
              <button
                type="button"
                onClick={() => setShowAddInsurance(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onUpdatePrescription={handleUpdatePrescriptionStatus}
          onUpdatePayment={handleUpdatePaymentStatus}
          onUpdateInsurance={handleUpdateInsuranceStatus}
        />
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function EditStockModal({ stock, onClose, onSave }: {
  stock: any;
  onClose: () => void;
  onSave: (medicineId: number, quantity: number, priceRWF: number) => void;
}) {
  const [quantity, setQuantity] = useState(stock.quantity.toString());
  const [priceRWF, setPriceRWF] = useState(stock.priceRWF.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(stock.medicineId, parseInt(quantity), parseFloat(priceRWF));
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Stock</h2>
      <div className="mb-4">
        <p className="font-semibold text-gray-900">{stock.name}</p>
        {stock.strength && <p className="text-sm text-gray-600">{stock.strength}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (RWF)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceRWF}
            onChange={(e) => setPriceRWF(e.target.value)}
            required
            className="input-field"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 btn-primary bg-pharmacy-600 hover:bg-pharmacy-700">
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

function OrderDetailsModal({ order, onClose, onUpdateStatus, onUpdatePrescription, onUpdatePayment, onUpdateInsurance }: {
  order: any;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onUpdatePrescription: (orderId: string, status: string) => void;
  onUpdatePayment: (orderId: string, paymentStatus: string) => void;
  onUpdateInsurance: (orderId: string, insuranceStatus: string, coveragePercent: number | null) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p><span className="font-medium">Name:</span> {order.customerName}</p>
              {order.customerEmail && (
                <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
              )}
              {order.customerPhone && (
                <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.itemDetails?.map((item: any, idx: number) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.medicine_name} {item.medicine_strength || ''}
                    </p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-primary-600">
                    {(item.price_rwf * item.quantity).toLocaleString()} RWF
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {order.total?.toLocaleString()} RWF
              </span>
            </div>
          </div>

          {/* Prescription */}
          {order.prescriptionFile && (
            <PrescriptionViewer
              prescriptionFile={order.prescriptionFile}
              prescriptionStatus={order.prescriptionStatus}
              orderId={order.id}
              onUpdatePrescription={onUpdatePrescription}
            />
          )}

          {/* Delivery Info */}
          {order.delivery && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Delivery Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><span className="font-medium">Address:</span> {order.address || 'Not provided'}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Payment & Insurance</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p><span className="font-medium">Payment Method:</span> {order.paymentMethod || 'cash'}</p>
              {order.paymentPhone && <p><span className="font-medium">Payment Phone:</span> {order.paymentPhone}</p>}
              {order.insuranceProvider && <p><span className="font-medium">Insurance:</span> {order.insuranceProvider}</p>}
              {order.coveragePercent && <p><span className="font-medium">Coverage:</span> {order.coveragePercent}%</p>}
              <p><span className="font-medium">Payment Status:</span> {order.paymentStatus || 'pending'}</p>
              <p><span className="font-medium">Insurance Status:</span> {order.insuranceStatus || 'not_required'}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => onUpdatePayment(order.id, 'approved')} className="btn-secondary text-sm">Approve Payment</button>
              <button onClick={() => onUpdatePayment(order.id, 'rejected')} className="btn-secondary text-sm border-red-500 text-red-700">Reject Payment</button>
              <button onClick={() => onUpdateInsurance(order.id, 'approved', 100)} className="btn-secondary text-sm">Approve Insurance 100%</button>
              <button onClick={() => onUpdateInsurance(order.id, 'approved', 75)} className="btn-secondary text-sm">Approve 75%</button>
              <button onClick={() => onUpdateInsurance(order.id, 'approved', 50)} className="btn-secondary text-sm">Approve 50%</button>
              <button onClick={() => onUpdateInsurance(order.id, 'approved', 25)} className="btn-secondary text-sm">Approve 25%</button>
              <button onClick={() => onUpdateInsurance(order.id, 'rejected', null)} className="btn-secondary text-sm border-red-500 text-red-700">Reject Insurance</button>
            </div>
          </div>

          {/* Order Status */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Order Status</h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onUpdateStatus(order.id, 'pending')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  order.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'processing')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  order.status === 'processing'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Processing
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'completed')}
                className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  order.status === 'completed'
                    ? 'bg-pharmacy-100 text-pharmacy-700 border-2 border-pharmacy-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
