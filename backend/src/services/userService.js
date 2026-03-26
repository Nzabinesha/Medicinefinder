import { getSupabase } from '../lib/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'medifinder-secret-key-change-in-production';
const ADMIN_EMAIL = 'nzabineshamerci99@gmail.com';
const ADMIN_PASSWORD = 'Merci';

function jwtPayload(user) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? undefined,
    role: user.role,
    ...(user.pharmacy_id ? { pharmacyId: user.pharmacy_id } : {}),
  };
}

export async function createUser(userData) {
  const supabase = getSupabase();
  const { name, email, password, phone, role = 'user' } = userData;

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
  if (existing) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = role === 'pharmacy' ? 'pharmacy' : 'user';
  const id =
    userRole === 'pharmacy'
      ? `pharmacy-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      : `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  const { data: user, error } = await supabase
    .from('users')
    .insert({
      id,
      email,
      name,
      phone: phone || null,
      password: hashedPassword,
      role: userRole,
    })
    .select('id, email, name, phone, role, pharmacy_id, created_at')
    .single();

  if (error) {
    if (error.code === '23505' || error.code === 23505) {
      throw new Error('User already exists');
    }
    throw new Error(error.message);
  }

  const token = jwt.sign(jwtPayload(user), JWT_SECRET, { expiresIn: '7d' });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      role: user.role,
      pharmacyId: user.pharmacy_id || undefined,
      createdAt: user.created_at,
    },
    token,
  };
}

export async function authenticateUser(email, password) {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const user = {
      id: 'admin-1',
      email: ADMIN_EMAIL,
      name: 'Administrator',
      phone: null,
      role: 'admin',
      pharmacy_id: null,
      created_at: null,
    };
    const token = jwt.sign(jwtPayload(user), JWT_SECRET, { expiresIn: '7d' });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || undefined,
        role: user.role,
        createdAt: user.created_at,
      },
      token,
    };
  }

  const supabase = getSupabase();
  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const { password: _pw, ...safe } = user;
  const token = jwt.sign(jwtPayload(safe), JWT_SECRET, { expiresIn: '7d' });

  return {
    user: {
      id: safe.id,
      email: safe.email,
      name: safe.name,
      phone: safe.phone,
      role: safe.role,
      pharmacyId: safe.pharmacy_id || undefined,
      createdAt: safe.created_at,
    },
    token,
  };
}

export async function findUserByEmail(email) {
  const supabase = getSupabase();
  const { data } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  return data;
}

export async function findUserById(id) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('users')
    .select('id, email, name, phone, role, pharmacy_id, created_at')
    .eq('id', id)
    .maybeSingle();
  return data;
}
