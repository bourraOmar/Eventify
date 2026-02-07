import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    try {
      // Check if admin already exists
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@eventify.com';
      const existingAdmin = await this.userModel.findOne({ email: adminEmail });

      if (existingAdmin) {
        this.logger.log('Admin user already exists');
        return;
      }

      // Create admin user
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await this.userModel.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });

      this.logger.log('✅ Admin user created successfully');
      this.logger.log(`📧 Email: ${adminEmail}`);
      this.logger.log(`🔑 Password: ${adminPassword}`);
      this.logger.log('⚠️  Please change the password after first login!');
    } catch (error) {
      this.logger.error('Failed to seed admin user', error);
    }
  }
}
