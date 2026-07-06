const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const ENGINE_DEFINITIONS = [
  { code: 'v1-seq', label: 'V1 Sequential', category: 'pairwise' },
  { code: 'v1-fam', label: 'V1 Family', category: 'pairwise' },
  { code: 'v2', label: 'V2 Cross-Pattern', category: 'pairwise' },
  { code: 'same-day', label: 'Lunchtime to Teatime', category: 'pairwise' },
  { code: 'bonus-seq', label: 'Bonus Sequential', category: 'pairwise' },
  { code: 'bonus-fam', label: 'Bonus Family', category: 'pairwise' },
  { code: 'bonus-v2', label: 'Bonus V2', category: 'pairwise' },
  { code: 'v3', label: 'V3 Zubro Tracker', category: 'triplet' },
  { code: 'repeats', label: 'Repeats Tracker', category: 'tool' },
];

async function main() {
  for (const def of ENGINE_DEFINITIONS) {
    await prisma.engineDefinition.upsert({
      where: { code: def.code },
      update: { label: def.label, category: def.category },
      create: def,
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@uk49s.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'change-me-immediately';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        displayName: 'Admin',
        role: 'admin',
      },
    });
    console.log(`Seeded admin user ${adminEmail} (change the password immediately).`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
