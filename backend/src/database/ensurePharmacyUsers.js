import 'dotenv/config';
import { getSupabase, assertSupabaseEnv } from '../lib/supabase.js';
import { ensurePharmacyPortalUsers, pharmacyPortalEmail } from '../lib/pharmacyPortalAccounts.js';

const DEFAULT_SEED_PASSWORD = 'PharmaSeed#Dev1';

async function main() {
  assertSupabaseEnv();
  const password = process.env.SEED_PHARMACY_PASSWORD || DEFAULT_SEED_PASSWORD;
  if (!process.env.SEED_PHARMACY_PASSWORD) {
    console.warn(
      `⚠️  SEED_PHARMACY_PASSWORD not set; using default "${DEFAULT_SEED_PASSWORD}". Set it in backend/.env for a private password.`
    );
  }

  const supabase = getSupabase();
  const { data: pharmacies, error } = await supabase
    .from('pharmacies')
    .select('id, name, phone')
    .order('id');

  if (error) {
    console.error('Failed to list pharmacies:', error.message);
    process.exit(1);
  }
  if (!pharmacies?.length) {
    console.log('No pharmacies in database. Nothing to do.');
    return;
  }

  const { created, skipped } = await ensurePharmacyPortalUsers(supabase, pharmacies, password);

  if (created.length) {
    console.log(`\n✅ Created ${created.length} pharmacy portal user(s). Use Pharmacy Login with:\n`);
    console.log('   Email pattern:    portal.{pharmacy-id}@medifinder.test');
    console.log(`   Password:         (value of SEED_PHARMACY_PASSWORD, or default above)\n`);
    for (const row of created) {
      console.log(`   • ${row.name}`);
      console.log(`     ${pharmacyPortalEmail(row.pharmacyId)}\n`);
    }
  }

  if (skipped.length) {
    console.log(`Skipped ${skipped.length} pharmacy/pharmacies:`);
    for (const s of skipped) {
      console.log(`   • ${s.pharmacyId} ${s.name}: ${s.reason}`);
    }
  }

  if (!created.length && !skipped.length) {
    console.log('Nothing changed.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
