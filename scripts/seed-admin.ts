import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('デフォルト管理者ユーザーを作成しています...');

  const passwordHash = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@dialog-ehr.local',
      passwordHash,
      fullName: 'システム管理者',
      role: 'DOCTOR',
      department: 'IT',
      isAdmin: true,
      isActive: true,
      mustChangePassword: true,
    },
  });

  console.log('✓ 管理者ユーザーを作成しました');
  console.log('');
  console.log('ログイン情報:');
  console.log('  ユーザー名: admin');
  console.log('  パスワード: Admin123!');
  console.log('');
  console.log('初回ログイン後、パスワードの変更が必要です。');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('エラーが発生しました:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
