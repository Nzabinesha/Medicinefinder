// Dashboard API for pharmacy management
import { API_BASE } from './apiBase';

export async function getPharmacyStock(token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stock`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch stock');
  } catch (error) {
    console.error('Error fetching stock:', error);
    throw error;
  }
}

export async function addStock(medicineId: number, quantity: number, priceRWF: number, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ medicineId, quantity, priceRWF }),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to add stock');
  } catch (error) {
    console.error('Error adding stock:', error);
    throw error;
  }
}

export async function updateStock(medicineId: number, quantity: number, priceRWF: number, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stock/${medicineId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity, priceRWF }),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to update stock');
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
}

export async function deleteStock(medicineId: number, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stock/${medicineId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete stock');
  } catch (error) {
    console.error('Error deleting stock:', error);
    throw error;
  }
}

export async function getAllMedicines(token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/medicines`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch medicines');
  } catch (error) {
    console.error('Error fetching medicines:', error);
    throw error;
  }
}

export async function getPharmacyOrders(token: string, status?: string) {
  try {
    const url = status 
      ? `${API_BASE}/dashboard/orders?status=${status}`
      : `${API_BASE}/dashboard/orders`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch orders');
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function getOrderDetails(orderId: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch order details');
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to update order status');
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function updatePrescriptionStatus(orderId: string, prescriptionStatus: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/orders/${orderId}/prescription`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ prescriptionStatus }),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to update prescription status');
  } catch (error) {
    console.error('Error updating prescription status:', error);
    throw error;
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentStatus }),
    });
    if (response.ok) return await response.json();
    const error = await response.json();
    throw new Error(error.message || 'Failed to update payment status');
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

export async function updateInsuranceStatus(orderId: string, insuranceStatus: string, coveragePercent: number | null, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/orders/${orderId}/insurance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ insuranceStatus, coveragePercent }),
    });
    if (response.ok) return await response.json();
    const error = await response.json();
    throw new Error(error.message || 'Failed to update insurance status');
  } catch (error) {
    console.error('Error updating insurance status:', error);
    throw error;
  }
}

export async function getPharmacyInsurance(token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/insurance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch insurance');
  } catch (error) {
    console.error('Error fetching insurance:', error);
    throw error;
  }
}

export async function getAllInsuranceTypes(token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/insurance/available`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch insurance types');
  } catch (error) {
    console.error('Error fetching insurance types:', error);
    throw error;
  }
}

export async function addInsurancePartner(insuranceId: number, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/insurance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ insuranceId }),
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to add insurance partner');
  } catch (error) {
    console.error('Error adding insurance partner:', error);
    throw error;
  }
}

export async function removeInsurancePartner(insuranceId: number, token: string) {
  try {
    const response = await fetch(`${API_BASE}/dashboard/insurance/${insuranceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
      return await response.json();
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove insurance partner');
  } catch (error) {
    console.error('Error removing insurance partner:', error);
    throw error;
  }
}

