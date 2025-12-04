const fs = require('fs');
const path = require('path');

// Create index.js that exports PrismaClient
// The key insight: We need to avoid Node.js type stripping
// Solution: Use a simple re-export that webpack will process
const indexJsPath = path.join(__dirname, '../node_modules/.prisma/client/index.js');

// Simple re-export - webpack will handle TypeScript compilation
const indexJsContent = `// Bridge file - webpack will handle TypeScript compilation
// Export PrismaClient - webpack transforms this during build
module.exports = require('./client');
`;

// Modify @prisma/client/default.js
const prismaClientDefaultPath = path.join(__dirname, '../node_modules/@prisma/client/default.js');
const defaultJsContent = `// Modified to work with custom Prisma output path
module.exports = require('../../.prisma/client');
`;

// Ensure directories exist
const indexDir = path.dirname(indexJsPath);
if (!fs.existsSync(indexDir)) {
  fs.mkdirSync(indexDir, { recursive: true });
}

// Create index.js
fs.writeFileSync(indexJsPath, indexJsContent);
console.log('Created Prisma Client index.js');

// Update default.js
if (fs.existsSync(prismaClientDefaultPath)) {
  fs.writeFileSync(prismaClientDefaultPath, defaultJsContent);
  console.log('Updated @prisma/client/default.js');
} else {
  console.warn('Warning: @prisma/client/default.js not found. Run: npm install');
}
