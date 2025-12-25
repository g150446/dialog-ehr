import { execSync } from 'child_process';
import { prisma } from '../lib/db';

/**
 * Verifies that the database schema is in sync with Prisma schema.
 * This prevents runtime errors from missing columns or tables.
 */
async function verifySchema() {
  try {
    console.log('🔍 Verifying database schema...\n');

    // Check migration status
    console.log('1. Checking migration status...');
    try {
      const statusOutput = execSync('npx prisma migrate status', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
      
      if (statusOutput.includes('Database schema is up to date!')) {
        console.log('   ✅ All migrations are applied\n');
      } else {
        console.error('   ❌ Migrations are not up to date!');
        console.error('   Run: npx prisma migrate dev');
        process.exit(1);
      }
    } catch (error: any) {
      console.error('   ❌ Error checking migration status:', error.message);
      process.exit(1);
    }

    // Verify critical tables exist
    console.log('2. Verifying critical tables exist...');
    const criticalTables = [
      'patients',
      'visits',
      'medical_records',
      'monitoring_records',
      'users',
      'audit_logs',
    ];

    for (const table of criticalTables) {
      try {
        const result = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          table
        );
        
        if (result[0]?.exists) {
          console.log(`   ✅ Table '${table}' exists`);
        } else {
          console.error(`   ❌ Table '${table}' is missing!`);
          console.error('   Run: npx prisma migrate dev');
          process.exit(1);
        }
      } catch (error) {
        console.error(`   ❌ Error checking table '${table}':`, error);
        process.exit(1);
      }
    }
    console.log('');

    // Verify critical columns exist in medical_records
    console.log('3. Verifying critical columns in medical_records...');
    const criticalColumns = ['authorId', 'authorRole', 'authorName', 'deletedAt'];
    
    for (const column of criticalColumns) {
      try {
        const result = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
          `SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'medical_records' 
            AND column_name = $1
          )`,
          column
        );
        
        if (result[0]?.exists) {
          console.log(`   ✅ Column 'medical_records.${column}' exists`);
        } else {
          console.error(`   ❌ Column 'medical_records.${column}' is missing!`);
          console.error('   Run: npx prisma migrate dev');
          process.exit(1);
        }
      } catch (error) {
        console.error(`   ❌ Error checking column '${column}':`, error);
        process.exit(1);
      }
    }
    console.log('');

    // Verify Prisma Client is generated
    console.log('4. Verifying Prisma Client is generated...');
    try {
      // Try to use Prisma Client - if it fails, it's not generated
      await prisma.$connect();
      console.log('   ✅ Prisma Client is generated and can connect\n');
    } catch (error) {
      console.error('   ❌ Prisma Client error:', error);
      console.error('   Run: npx prisma generate');
      process.exit(1);
    }

    console.log('✅ Database schema verification passed!');
    console.log('   The database is ready to use.\n');
  } catch (error) {
    console.error('❌ Schema verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();
