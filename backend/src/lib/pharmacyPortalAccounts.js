import bcrypt from 'bcryptjs';

/**
 * Stable synthetic email per pharmacy id (valid for HTML email inputs).
 * Example: ph-001 → portal.ph-001@medifinder.test
 */
export function pharmacyPortalEmail(pharmacyId) {
  const id = String(pharmacyId).trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return `portal.${id}@medifinder.test`;
}

/**
 * Ensures each pharmacy has one dashboard login (users.role = pharmacy, pharmacy_id set).
 * Skips when a pharmacy user is already linked.
 */
export async function ensurePharmacyPortalUsers(supabase, pharmacies, password) {
  const hashed = await bcrypt.hash(password, 10);
  const created = [];
  const skipped = [];

  for (const ph of pharmacies) {
    const { data: linked } = await supabase
      .from('users')
      .select('id')
      .eq('pharmacy_id', ph.id)
      .eq('role', 'pharmacy')
      .maybeSingle();

    if (linked) {
      skipped.push({ pharmacyId: ph.id, name: ph.name, reason: 'already has portal user' });
      continue;
    }

    const email = pharmacyPortalEmail(ph.id);
    const { data: emailTaken } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (emailTaken) {
      skipped.push({
        pharmacyId: ph.id,
        name: ph.name,
        reason: `email ${email} already registered`,
      });
      continue;
    }

    const userId = `pharmacy-portal-${ph.id}`;
    const { error } = await supabase.from('users').insert({
      id: userId,
      email,
      name: ph.name,
      phone: ph.phone ?? null,
      password: hashed,
      role: 'pharmacy',
      pharmacy_id: ph.id,
    });

    if (error) {
      skipped.push({ pharmacyId: ph.id, name: ph.name, reason: error.message });
      continue;
    }

    created.push({
      pharmacyId: ph.id,
      name: ph.name,
      email,
    });
  }

  return { created, skipped };
}
