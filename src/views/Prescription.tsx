import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { createOrder, getInsuranceTypeOptions } from '@/services/api';

export function Prescription() {
  const navigate = useNavigate();
  const { items, total, clear } = useCartStore();
  const { token } = useAuthStore();
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'pending' | 'approved' | 'rejected'>('idle');
  const [delivery, setDelivery] = useState(true);
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'insurance'>('cash');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insuranceCoveragePercent, setInsuranceCoveragePercent] = useState<number | null>(null);
  const [insuranceOptions, setInsuranceOptions] = useState<string[]>([]);
  const [payerName, setPayerName] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [insuranceDocuments, setInsuranceDocuments] = useState<string | null>(null);

  useEffect(() => {
    getInsuranceTypeOptions().then(setInsuranceOptions).catch(() => setInsuranceOptions([]));
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const inputElement = e.target;
    
    if (!file) return;
    
    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      alert('File size exceeds 50MB limit. Please choose a smaller file.');
      inputElement.value = '';
      return;
    }
    
    setFileName(file.name);
    setStatus('uploading');
    setFilePreview(null); // Clear previous preview
    
    // Handle both images and PDFs
    const reader = new FileReader();
    
    // Create a promise that resolves when the file is read
    const fileReadPromise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
    });
    
    // Read the file as data URL
    reader.readAsDataURL(file);
    
    try {
      // Wait for the file to be read
      const dataUrl = await fileReadPromise;
      
      // Validate the data URL
      if (!dataUrl || dataUrl.length < 100) {
        throw new Error('Invalid data URL generated');
      }
      
      console.log('File read successfully:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dataUrlLength: dataUrl.length,
        dataUrlPrefix: dataUrl.substring(0, 50)
      });
      
      setFilePreview(dataUrl);
      setStatus('pending');
    } catch (error) {
      console.error('Error reading file:', error);
      alert(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setStatus('idle');
      setFileName(null);
      setFilePreview(null);
      // Reset the file input
      inputElement.value = '';
    }
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();// PAYMENT VALIDATION
    if (paymentMethod === 'cash') {
      if (!paymentPhone || !payerName) {
        alert('Please fill all cash payment fields');
        return;
      }
    }
    
    if (paymentMethod === 'insurance') {
      if (!insuranceProvider || !insuranceCoveragePercent || !membershipId) {
        alert('Please complete insurance details');
        return;
      }
    }
    
    const requiresPrescription = items.some(item => item.requiresPrescription);
    if (requiresPrescription && !filePreview && !fileName) {
      alert('Please upload your prescription first');
      return;
    }
    
    setPlacing(true);
    
    try {
      const pharmacyId = items[0]?.pharmacyId;
      if (!pharmacyId) {
        throw new Error('Pharmacy ID not found');
      }

      if (!token) throw new Error('Please login first');

      await createOrder(token, {
        pharmacyId,
        items: items.map(item => ({
          name: item.name,
          medicineId: item.medicineId,
          quantity: item.quantity
        })),
        delivery,
        deliveryAddress: delivery ? address : null,
        prescriptionFile: filePreview || null,
        paymentMethod,
        paymentPhone: paymentPhone || null,
        paymentProof: paymentMethod === 'cash' ? payerName : null,
        insuranceDocuments: paymentMethod === 'insurance' ? membershipId : null,
        insuranceProvider: paymentMethod === 'insurance' ? insuranceProvider : null,
        insuranceCoveragePercent: paymentMethod === 'insurance' ? insuranceCoveragePercent : null,
      });
      clear();
      navigate('/notifications');
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  const requiresPrescription = items.some(item => item.requiresPrescription === true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">📋 Prescription & Order</h1>
          <p className="text-primary-100">Upload your prescription and complete your order</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {items.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🛒</span> Order Summary
                </h2>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-primary-600">
                        {(item.priceRWF * item.quantity).toLocaleString()} RWF
                      </p>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {total().toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💳</span> Payment Method
              </h2><div className="space-y-4 mb-6">

{/* SELECT METHOD */}
<label className="flex items-center gap-3">
  <input
    type="radio"
    name="payment-method"
    checked={paymentMethod === 'cash'}
    onChange={() => setPaymentMethod('cash')}
  />
  <span>Cash</span>
</label>

<label className="flex items-center gap-3">
  <input
    type="radio"
    name="payment-method"
    checked={paymentMethod === 'insurance'}
    onChange={() => setPaymentMethod('insurance')}
  />
  <span>Insurance</span>
</label>

{/* ===================== CASH ===================== */}
{paymentMethod === 'cash' && (
  <div className="space-y-3 border p-4 rounded-lg bg-gray-50">
    <h3 className="font-semibold text-gray-800">Cash Payment Details</h3>

    <input
      type="tel"
      className="input-field"
      placeholder="Phone number used for payment"
      value={paymentPhone}
      onChange={(e) => setPaymentPhone(e.target.value)}
      required
    />

    {/* ✅ NEW FIELD */}
    <input
      type="text"
      className="input-field"
      placeholder="Name of person paying"
      value={paymentProof || ''}
      onChange={(e) => setPaymentProof(e.target.value)}
      required
    />
  </div>
)}

{/* ===================== INSURANCE ===================== */}
{paymentMethod === 'insurance' && (
  <div className="space-y-3 border p-4 rounded-lg bg-blue-50">

    <h3 className="font-semibold text-gray-800">Insurance Payment</h3>

    {/* Provider */}
    <select
      className="input-field"
      value={insuranceProvider}
      onChange={(e) => setInsuranceProvider(e.target.value)}
      required
    >
      <option value="">Select insurance provider</option>
      {insuranceOptions.map((name) => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>

    {/* Coverage */}
    <select
      className="input-field"
      value={insuranceCoveragePercent ?? ''}
      onChange={(e) =>
        setInsuranceCoveragePercent(
          e.target.value ? Number(e.target.value) : null
        )
      }
    >
      <option value="">Select coverage</option>
      <option value="100">100%</option>
      <option value="80">80%</option>
      <option value="75">75%</option>
      <option value="50">50%</option>
      <option value="25">25%</option>
    </select>

    {/* ✅ NEW FIELD: Membership ID */}
    <input
  type="text"
  className="input-field"
  placeholder="Enter Membership ID"
  value={membershipId}
  onChange={(e) => setMembershipId(e.target.value)}
  required
/>

    {/* ✅ SHOW REMAINING PAYMENT */}
    {insuranceCoveragePercent && (
      <div className="p-3 bg-white rounded border">
        <p className="text-sm text-gray-600">
          Total: {total().toLocaleString()} RWF
        </p>
        <p className="text-sm text-gray-600">
          Covered: {(total() * insuranceCoveragePercent / 100).toLocaleString()} RWF
        </p>
        <p className="font-bold text-red-600">
          You Pay: {(total() - (total() * insuranceCoveragePercent / 100)).toLocaleString()} RWF
        </p>
      </div>
    )}
  </div>
)}
</div>
</div>
              
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📄</span> Prescription Upload
                {requiresPrescription && (
                  <span className="ml-auto text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                    Required
                  </span>
                )}
              </h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    id="prescription-upload"
                    accept="image/*,application/pdf"
                    onChange={onUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="prescription-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-lg font-semibold text-gray-700 mb-2">
                      {fileName ? 'Change File' : 'Upload Prescription'}
                    </span>
                    <span className="text-sm text-gray-500">
                      PDF, JPG, PNG (Max 50MB)
                    </span>
                  </label>
                </div>

                {filePreview && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    {filePreview.startsWith('data:application/pdf') || filePreview.includes('application/pdf') ? (
                      <iframe
                        src={filePreview}
                        className="w-full h-96 rounded border"
                        title="Prescription preview"
                      />
                    ) : (
                      <div className="relative">
                        <img 
                          src={filePreview} 
                          alt="Prescription preview" 
                          className="max-w-full h-auto rounded border"
                          style={{ display: 'block' }}
                          onError={(e) => {
                            console.error('Error loading image preview:', {
                              src: filePreview?.substring(0, 100),
                              srcLength: filePreview?.length
                            });
                            const img = e.currentTarget;
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent && !parent.querySelector('.error-message')) {
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'error-message p-4 text-center text-red-600 bg-red-50 rounded';
                              errorDiv.textContent = 'Failed to load image preview. The file may be corrupted or too large.';
                              parent.appendChild(errorDiv);
                            }
                          }}
                          onLoad={(e) => {
                            console.log('Image preview loaded successfully:', {
                              naturalWidth: e.currentTarget.naturalWidth,
                              naturalHeight: e.currentTarget.naturalHeight
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {status === 'uploading' && !filePreview && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                      <p className="text-sm text-gray-700">Reading file...</p>
                    </div>
                  </div>
                )}

                {status !== 'idle' && (
                  <div className={`p-4 rounded-lg ${
                    status === 'approved' ? 'bg-pharmacy-50 border border-pharmacy-200' :
                    status === 'rejected' ? 'bg-red-50 border border-red-200' :
                    status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-primary-50 border border-primary-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {status === 'uploading' && (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                          <p className="text-primary-700 font-medium">Uploading prescription...</p>
                        </>
                      )}
                      {status === 'pending' && (
                        <>
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-yellow-800 font-medium">Prescription uploaded successfully!</p>
                            <p className="text-yellow-700 text-sm mt-1">Waiting for pharmacy approval. You can place your order now.</p>
                          </div>
                        </>
                      )}
                      {status === 'approved' && (
                        <>
                          <svg className="w-6 h-6 text-pharmacy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-pharmacy-700 font-medium">Prescription verified and approved!</p>
                        </>
                      )}
                      {status === 'rejected' && (
                        <>
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <p className="text-red-700 font-medium">Prescription rejected. Please upload a valid prescription.</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🚚</span> Delivery Options
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    checked={!delivery}
                    onChange={() => setDelivery(false)}
                    className="w-5 h-5 text-primary-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Pickup from Pharmacy</p>
                    <p className="text-sm text-gray-600">Collect your order from the pharmacy</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery}
                    onChange={() => setDelivery(true)}
                    className="w-5 h-5 text-primary-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Home Delivery</p>
                    <p className="text-sm text-gray-600">Get your medicines delivered to your address</p>
                  </div>
                </label>
                {delivery && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required={delivery}
                      className="input-field"
                      rows={3}
                      placeholder="Enter your full delivery address..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-primary-50 border-2 border-primary-200">
              <h3 className="font-bold text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium text-gray-900">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-primary-600 text-lg">
                    {total().toLocaleString()} RWF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="font-medium text-gray-900">
                    {delivery ? 'Home Delivery' : 'Pickup'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePlaceOrder}
                disabled={placing || (requiresPrescription && !filePreview && !fileName)}
                className={`w-full btn-primary ${placing || (requiresPrescription && !filePreview && !fileName) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {placing ? 'Placing Order...' : 'Place Order'}
                
              </button>
              <Link to="/cart" className="block w-full btn-secondary text-center">
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

