import express from 'express';
import { createUser, authenticateUser } from '../services/userService.js';
import { authenticateToken } from '../middleware/auth.js';
import { getSupabase } from '../lib/supabase.js';
import bcrypt from 'bcryptjs';

export const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, email, and password are required',
      });
    }

    const strongPassword =
      typeof password === 'string' &&
      password.length >= 8 &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!strongPassword) {
      return res.status(400).json({
        error: 'Validation error',
        message:
          'Password must be strong (min 8 chars, include uppercase, lowercase, number, and special character)',
      });
    }

    if (role && !['user', 'pharmacy'].includes(role)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Role must be either "user" or "pharmacy"',
      });
    }

    const result = await createUser({ name, email, password, phone, role });
    res.status(201).json(result);
  } catch (error) {
    console.error('Signup error:', error);

    if (error.message === 'User already exists') {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists',
      });
    }

    res.status(500).json({
      error: 'Signup failed',
      message: error.message,
    });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required',
      });
    }

    const result = await authenticateUser(email, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
      });
    }

    res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
});

authRouter.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Validation error', message: 'currentPassword and newPassword are required' });
    }
    const strongPassword =
      typeof newPassword === 'string' &&
      newPassword.length >= 8 &&
      /[a-z]/.test(newPassword) &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword);
    if (!strongPassword) {
      return res.status(400).json({ error: 'Validation error', message: 'New password must be strong' });
    }

    const supabase = getSupabase();
    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, password, role')
      .eq('id', req.user.userId)
      .maybeSingle();
    if (fetchErr) {
      return res.status(500).json({ error: 'Failed to load user', message: fetchErr.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'Not found', message: 'User not found' });
    }
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Authentication failed', message: 'Current password is incorrect' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    const { error: upErr } = await supabase
      .from('users')
      .update({ password: hashed, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (upErr) {
      return res.status(500).json({ error: 'Failed to change password', message: upErr.message });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password', message: error.message });
  }
});
