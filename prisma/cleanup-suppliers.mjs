// Script to delete ALL supplier data from the database
// Run with: node prisma/cleanup-suppliers.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Starting supplier data cleanup...\n');

    // Delete in correct order (child tables first due to foreign keys)

    // 1. Supplier Documents
    const docs = await prisma.supplierDocument.deleteMany({});
    console.log(`  ✅ Deleted ${docs.count} supplier documents`);

    // 2. Products
    const products = await prisma.product.deleteMany({});
    console.log(`  ✅ Deleted ${products.count} products`);

    // 3. Supplier Categories
    const cats = await prisma.supplierCategory.deleteMany({});
    console.log(`  ✅ Deleted ${cats.count} supplier categories`);

    // 4. Verification Events
    const events = await prisma.verificationEvent.deleteMany({});
    console.log(`  ✅ Deleted ${events.count} verification events`);

    // 5. Supplier Ratings
    const ratings = await prisma.supplierRating.deleteMany({});
    console.log(`  ✅ Deleted ${ratings.count} supplier ratings`);

    // 6. Supplier Contact Logs
    const contacts = await prisma.supplierContactLog.deleteMany({});
    console.log(`  ✅ Deleted ${contacts.count} supplier contact logs`);

    // 7. Saved Suppliers
    const saved = await prisma.savedSupplier.deleteMany({});
    console.log(`  ✅ Deleted ${saved.count} saved suppliers`);

    // 8. Trial Extension Requests
    const trials = await prisma.trialExtensionRequest.deleteMany({});
    console.log(`  ✅ Deleted ${trials.count} trial extension requests`);

    // 9. Subscription Payments
    const subs = await prisma.subscriptionPayment.deleteMany({});
    console.log(`  ✅ Deleted ${subs.count} subscription payments`);

    // 10. Inquiries (supplier-related)
    const inquiries = await prisma.inquiry.deleteMany({});
    console.log(`  ✅ Deleted ${inquiries.count} inquiries`);

    // 11. Finally, delete all Suppliers
    const suppliers = await prisma.supplier.deleteMany({});
    console.log(`  ✅ Deleted ${suppliers.count} suppliers`);

    console.log('\n✨ All supplier data has been wiped clean!');
    console.log('   Database is now empty of supplier records.');
}

main()
    .catch((e) => {
        console.error('❌ Error during cleanup:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
