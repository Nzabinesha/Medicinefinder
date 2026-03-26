import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getSupabase } from '../lib/supabase.js';
import { findUserById } from '../services/userService.js';

export const notificationsRouter = express.Router();

notificationsRouter.use(authenticateToken);

notificationsRouter.get('/', async (req, res) => {
  try {
    const supabase = getSupabase();
    const role = req.user.role;
    let rows = [];

    if (role === 'pharmacy') {
      let pharmacyId = req.user.pharmacyId;
      if (!pharmacyId) {
        const u = await findUserById(req.user.userId);
        pharmacyId = u?.pharmacy_id;
      }
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, read, created_at')
        .eq('role_target', 'pharmacy')
        .eq('pharmacy_id', pharmacyId || '')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      rows = data || [];
    } else {
      let email = req.user.email;
      if (!email) {
        const u = await findUserById(req.user.userId);
        email = u?.email;
      }
      if (!email) {
        return res.json([]);
      }
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, read, created_at')
        .eq('role_target', 'user')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      rows = data || [];
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications', message: error.message });
  }
});

notificationsRouter.put('/:id/read', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification', message: error.message });
  }
});
