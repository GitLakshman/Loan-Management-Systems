import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import { User } from '../modules/users/user.model';
import { hashPassword } from '../utils/bcrypt';
import { Role } from '../types';

// Load env
config({ path: path.join(__dirname, '../../.env') });

const SEED_USERS = [
  { fullName: 'Admin User', email: 'admin@test.com', role: Role.ADMIN, phoneNumber: '9000000001' },
  { fullName: 'Sales Executive', email: 'sales@test.com', role: Role.SALES, phoneNumber: '9000000002' },
  { fullName: 'Sanction Officer', email: 'sanction@test.com', role: Role.SANCTION, phoneNumber: '9000000003' },
  { fullName: 'Disbursement Officer', email: 'disbursement@test.com', role: Role.DISBURSEMENT, phoneNumber: '9000000004' },
  { fullName: 'Collection Officer', email: 'collection@test.com', role: Role.COLLECTION, phoneNumber: '9000000005' },
];

const DEFAULT_PASSWORD = 'Password@123';

const seedDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/loan_management_system';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

    for (const userData of SEED_USERS) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⏩ User already exists: ${userData.email}`);
        continue;
      }

      await User.create({
        ...userData,
        password: hashedPassword,
        isActive: true,
      });
      console.log(`✅ Created: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Seed completed!');
    console.log('\nDefault credentials:');
    console.log('Password: Password@123');
    console.log('\nUsers:');
    SEED_USERS.forEach((u) => console.log(`  ${u.role}: ${u.email}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
