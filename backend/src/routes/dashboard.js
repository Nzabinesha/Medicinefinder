import express from 'express';
import { authenticateToken, requirePharmacy } from '../middleware/auth.js';
import {
  getPharmacyStock,
  updateStock,
  addStock,
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
  getPharmacyIdFromUser,
} from '../services/dashboardService.js';

export const dashboardRouter = express.Router();

dashboardRouter.use(authenticateToken);
dashboardRouter.use(requirePharmacy);

dashboardRouter.get('/stock', async (req, res) => {
  try {
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy. Please contact support.',
      });
    }
    const stock = await getPharmacyStock(pharmacyId);
    res.json(stock);
  } catch (error) {
    console.error('Error getting stock:', error);
    res.status(500).json({ error: 'Failed to get stock', message: error.message });
  }
});

dashboardRouter.post('/stock', async (req, res) => {
  try {
    const { medicineId, quantity, priceRWF } = req.body;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    if (medicineId === undefined || quantity === undefined || priceRWF === undefined) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'medicineId, quantity, and priceRWF are required',
      });
    }
    const stock = await addStock(pharmacyId, parseInt(String(medicineId), 10), quantity, priceRWF);
    res.json(stock);
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(500).json({ error: 'Failed to add stock', message: error.message });
  }
});

dashboardRouter.put('/stock/:medicineId', async (req, res) => {
  try {
    const { medicineId } = req.params;
    const { quantity, priceRWF } = req.body;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    if (quantity === undefined || priceRWF === undefined) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Quantity and priceRWF are required',
      });
    }
    const stock = await updateStock(pharmacyId, parseInt(medicineId, 10), quantity, priceRWF);
    res.json(stock);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock', message: error.message });
  }
});

dashboardRouter.delete('/stock/:medicineId', async (req, res) => {
  try {
    const { medicineId } = req.params;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    const stock = await deleteStock(pharmacyId, parseInt(medicineId, 10));
    res.json(stock);
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ error: 'Failed to delete stock', message: error.message });
  }
});

dashboardRouter.get('/medicines', async (req, res) => {
  try {
    const medicines = await getAllMedicines();
    res.json(medicines);
  } catch (error) {
    console.error('Error getting medicines:', error);
    res.status(500).json({ error: 'Failed to get medicines', message: error.message });
  }
});

dashboardRouter.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    const orders = await getPharmacyOrders(pharmacyId, status || null);
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Failed to get orders', message: error.message });
  }
});

dashboardRouter.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    if (!status) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status is required',
      });
    }
    const orders = await updateOrderStatus(pharmacyId, orderId, status);
    res.json(orders);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status', message: error.message });
  }
});

dashboardRouter.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    const order = await getOrderDetails(pharmacyId, orderId);
    res.json(order);
  } catch (error) {
    console.error('Error getting order details:', error);
    res.status(500).json({ error: 'Failed to get order details', message: error.message });
  }
});

dashboardRouter.put('/orders/:orderId/prescription', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { prescriptionStatus } = req.body;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    if (!prescriptionStatus) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Prescription status is required',
      });
    }
    const orders = await updatePrescriptionStatus(pharmacyId, orderId, prescriptionStatus);
    res.json(orders);
  } catch (error) {
    console.error('Error updating prescription status:', error);
    res.status(500).json({ error: 'Failed to update prescription status', message: error.message });
  }
});

dashboardRouter.put('/orders/:orderId/payment', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({ error: 'Pharmacy not found', message: 'Your account is not linked to a pharmacy.' });
    }
    if (!paymentStatus) {
      return res.status(400).json({ error: 'Validation error', message: 'paymentStatus is required' });
    }
    const orders = await updatePaymentStatus(pharmacyId, orderId, paymentStatus);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment status', message: error.message });
  }
});

dashboardRouter.put('/orders/:orderId/insurance', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { insuranceStatus, coveragePercent } = req.body;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({ error: 'Pharmacy not found', message: 'Your account is not linked to a pharmacy.' });
    }
    if (!insuranceStatus) {
      return res.status(400).json({ error: 'Validation error', message: 'insuranceStatus is required' });
    }
    const orders = await updateInsuranceStatus(pharmacyId, orderId, insuranceStatus, coveragePercent ?? null);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update insurance status', message: error.message });
  }
});

dashboardRouter.get('/insurance', async (req, res) => {
  try {
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    const insurance = await getPharmacyInsurance(pharmacyId);
    res.json(insurance);
  } catch (error) {
    console.error('Error getting insurance:', error);
    res.status(500).json({ error: 'Failed to get insurance', message: error.message });
  }
});

dashboardRouter.get('/insurance/available', async (req, res) => {
  try {
    const insuranceTypes = await getAllInsuranceTypes();
    res.json(insuranceTypes);
  } catch (error) {
    console.error('Error getting insurance types:', error);
    res.status(500).json({ error: 'Failed to get insurance types', message: error.message });
  }
});

dashboardRouter.post('/insurance', async (req, res) => {
  try {
    const { insuranceId } = req.body;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    if (!insuranceId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'insuranceId is required',
      });
    }
    const insurance = await addInsurancePartner(pharmacyId, parseInt(String(insuranceId), 10));
    res.json(insurance);
  } catch (error) {
    console.error('Error adding insurance:', error);
    res.status(500).json({ error: 'Failed to add insurance', message: error.message });
  }
});

dashboardRouter.delete('/insurance/:insuranceId', async (req, res) => {
  try {
    const { insuranceId } = req.params;
    const pharmacyId = await getPharmacyIdFromUser(req.user.userId, req.user.pharmacyId);
    if (!pharmacyId) {
      return res.status(404).json({
        error: 'Pharmacy not found',
        message: 'Your account is not linked to a pharmacy.',
      });
    }
    const insurance = await removeInsurancePartner(pharmacyId, parseInt(insuranceId, 10));
    res.json(insurance);
  } catch (error) {
    console.error('Error removing insurance:', error);
    res.status(500).json({ error: 'Failed to remove insurance', message: error.message });
  }
});
