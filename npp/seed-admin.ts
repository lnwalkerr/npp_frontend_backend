import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from './src/models/user';
import UserType from './src/models/userType';
import Platform from './src/models/platform';
import { Utils } from './src/utils/utils';

dotenv.config();

async function seedAdmin() {
  try {
    const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/npp_db';
    await mongoose.connect(dbUrl);
    console.log('Connected to database');

    // Check if admin userType exists
    let adminUserType = await UserType.findOne({ type: 'admin' });
    if (!adminUserType) {
      adminUserType = new UserType({
        type: 'admin',
        title: 'Administrator',
        description: 'Admin user type',
        created_by: null
      });
      await adminUserType.save();
      console.log('Created admin userType');
    }

    // Check if platform exists
    let platform = await Platform.findOne({ name: 'admin' });
    if (!platform) {
      platform = new Platform({
        platformId: 'admin_platform',
        name: 'admin',
        token: '$2b$10$jYyUG9kZfbM1KYTZHglwXOJwSXdW9jBP.6ak3YTlD/HJE9DgFXqM2'
      });
      await platform.save();
      console.log('Created admin platform');
    }

    // Check if admin user exists
    let adminUser = await User.findOne({ phone: 9999911111 });
    if (!adminUser) {
      adminUser = new User({
        userType: adminUserType._id,
        candidateId: 9999911111,
        firstName: 'Admin',
        lastName: 'User',
        phone: 9999911111,
        email: 'admin@npp.com',
        password: await Utils.encryptPassword('janParty@123'),
        otpStatus: true,
        status: true
      });
      await adminUser.save();
      console.log('Created admin user');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedAdmin();
