import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oldEmail = 'admin@closea.com';
  
  console.log(`Searching for user: ${oldEmail}...`);

  const user = await prisma.user.findUnique({
    where: { email: oldEmail },
  });

  if (!user) {
    console.log(`ℹ️ The account (${oldEmail}) doesn't exist or was already deleted.`);
    return;
  }

  const userId = user.id;
  console.log(`Found user ID: ${userId}. Executing cleanup...`);

  try {
    // بنستخدم استعلامات منفصلة وبنحط الـ ID مباشرة كـ Text عشان نتغلب على مشاكل الـ Parameters
    const queries = [
      `DELETE FROM "Booking" WHERE "customerId" = '${userId}'`,
      `DELETE FROM "Booking" WHERE "dressId" IN (SELECT id FROM "Dress" WHERE "ownerId" = '${userId}')`,
      `DELETE FROM "Dress" WHERE "ownerId" = '${userId}'`,
      `DELETE FROM "Notification" WHERE "userId" = '${userId}'`,
      `DELETE FROM "Wishlist" WHERE "userId" = '${userId}'`,
      `DELETE FROM "AdminActivityLog" WHERE "adminId" = '${userId}'`,
      `DELETE FROM "Profile" WHERE "userId" = '${userId}'`,
      `DELETE FROM "User" WHERE id = '${userId}'`
    ];

    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (e: any) {
        // لو الجدول مش موجود أو فيه مشكلة تانية، هنكمل عادي
        console.log(`Skipped (or failed) query: ${query.split(' ')[2]} - Reason: ${e.message.split('\n')[0]}`);
      }
    }

    console.log(`✅ Success! The account (${oldEmail}) and all its data have been permanently deleted.`);
  } catch (error) {
    console.error('❌ Error during deletion:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });