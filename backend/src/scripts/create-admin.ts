import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserDocument, UserRole } from '../users/schemas/user.schema';

async function createAdminUser() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>('UserModel');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@eventify.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  // Check if admin exists
  const existingAdmin = await userModel.findOne({ email: adminEmail });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    console.log(`📧 Email: ${adminEmail}`);
    await app.close();
    return;
  }

  // Create admin
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await userModel.create({
    name: 'Admin User',
    email: adminEmail,
    password: hashedPassword,
    role: UserRole.ADMIN,
  });

  console.log('✅ Admin user created successfully!');
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
  console.log('⚠️  Please change the password after first login!');

  await app.close();
}

createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  });
