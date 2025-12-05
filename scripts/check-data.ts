import { prisma } from '../lib/db';

async function checkData() {
  try {
    const count = await prisma.patient.count();
    console.log(`Patient count: ${count}`);
    
    if (count === 0) {
      console.log('\n⚠️  No patients found in database!');
      console.log('Run: npm run db:seed');
    } else {
      console.log(`\n✅ Found ${count} patients in database`);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error checking data:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkData();

