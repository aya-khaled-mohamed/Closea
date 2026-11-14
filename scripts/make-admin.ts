import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'ayakhalid019@gmail.com';
  const newPassword = 'AyaData2026AI!';

  console.log(`Checking account for: ${email}...`);

  // 1. تشفير الباسورد
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // 2. تحديث المستخدم في الداتابيز
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      passwordHash: passwordHash, // تغيير الباسورد
      role: 'ADMIN',              // ترقية الحساب لـ أدمن
      status: 'ACTIVE',           // التأكد من إنه مش موقوف
    },
  });

  console.log('✅ Success! The account has been updated.');
  console.log(`Email: ${updatedUser.email}`);
  console.log(`Role: ${updatedUser.role}`);
  console.log('You can now log in at /login');
}

main()
  .catch((e) => {
    console.error('❌ Error: Make sure this email is already registered on the website first.');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });