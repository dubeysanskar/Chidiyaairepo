import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Testing Database Connection ===\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection: SUCCESS\n');
    
    // Count records in each table
    const buyerCount = await prisma.buyer.count();
    console.log(`📊 Buyers: ${buyerCount}`);
    
    const supplierCount = await prisma.supplier.count();
    console.log(`📊 Suppliers: ${supplierCount}`);
    
    const categoryCount = await prisma.category.count();
    console.log(`📊 Categories: ${categoryCount}`);
    
    const categoryTemplateCount = await prisma.categoryTemplate.count();
    console.log(`📊 Category Templates: ${categoryTemplateCount}`);
    
    const productCount = await prisma.product.count();
    console.log(`📊 Products: ${productCount}`);
    
    const inquiryCount = await prisma.inquiry.count();
    console.log(`📊 Inquiries: ${inquiryCount}`);
    
    const chatSessionCount = await prisma.chatSession.count();
    console.log(`📊 Chat Sessions: ${chatSessionCount}`);
    
    const adminCount = await prisma.admin.count();
    console.log(`📊 Admins: ${adminCount}`);
    
    // Test a buyer lookup
    console.log('\n=== Testing Buyer Lookup ===');
    const sampleBuyer = await prisma.buyer.findFirst({
      select: { id: true, email: true, name: true, emailVerified: true, password: true }
    });
    if (sampleBuyer) {
      console.log(`✅ Sample buyer: ${sampleBuyer.email} (verified: ${sampleBuyer.emailVerified}, has password: ${!!sampleBuyer.password})`);
    } else {
      console.log('⚠️  No buyers found in database');
    }
    
    // Test a supplier lookup
    console.log('\n=== Testing Supplier Lookup ===');
    const sampleSupplier = await prisma.supplier.findFirst({
      select: { id: true, email: true, companyName: true, status: true, emailVerified: true }
    });
    if (sampleSupplier) {
      console.log(`✅ Sample supplier: ${sampleSupplier.email} (status: ${sampleSupplier.status}, verified: ${sampleSupplier.emailVerified})`);
    } else {
      console.log('⚠️  No suppliers found in database');
    }
    
    // Test bcrypt
    console.log('\n=== Testing bcrypt ===');
    const bcrypt = await import('bcryptjs');
    const testHash = await bcrypt.default.hash('testpass123', 10);
    const testCompare = await bcrypt.default.compare('testpass123', testHash);
    console.log(`✅ bcrypt hash/compare: ${testCompare ? 'SUCCESS' : 'FAILED'}`);
    
    // Test JWT
    console.log('\n=== Testing JWT ===');
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
    console.log(`JWT_SECRET: ${JWT_SECRET}`);
    const testToken = jwt.default.sign({ id: 'test', email: 'test@test.com' }, JWT_SECRET, { expiresIn: '7d' });
    const decoded = jwt.default.verify(testToken, JWT_SECRET);
    console.log(`✅ JWT sign/verify: SUCCESS (decoded: ${JSON.stringify(decoded)})`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
