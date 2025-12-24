import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.leaveRequest.deleteMany();
    await prisma.user.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            password: adminPassword,
            name: 'Administrator',
            email: 'admin@company.com',
            role: 'admin',
            department: 'Management',
            position: 'System Administrator',
            annualLeaveQuota: 12,
        },
    });
    console.log('✅ Created admin user:', admin.username);

    // Create regular users
    const userPassword = await bcrypt.hash('user123', 10);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                username: 'john',
                password: userPassword,
                name: 'John Doe',
                email: 'john@company.com',
                role: 'user',
                department: 'IT',
                position: 'Software Developer',
                annualLeaveQuota: 12,
            },
        }),
        prisma.user.create({
            data: {
                username: 'jane',
                password: userPassword,
                name: 'Jane Smith',
                email: 'jane@company.com',
                role: 'user',
                department: 'HR',
                position: 'HR Manager',
                annualLeaveQuota: 12,
            },
        }),
        prisma.user.create({
            data: {
                username: 'bob',
                password: userPassword,
                name: 'Bob Wilson',
                email: 'bob@company.com',
                role: 'user',
                department: 'Finance',
                position: 'Accountant',
                annualLeaveQuota: 12,
            },
        }),
    ]);
    console.log('✅ Created', users.length, 'regular users');

    // Create sample leave requests
    const leaveRequests = await Promise.all([
        // John's leaves
        prisma.leaveRequest.create({
            data: {
                userId: users[0].id,
                leaveType: 'annual',
                startDate: new Date('2024-12-20'),
                endDate: new Date('2024-12-24'),
                days: 5,
                reason: 'Liburan akhir tahun bersama keluarga',
                status: 'pending',
            },
        }),
        prisma.leaveRequest.create({
            data: {
                userId: users[0].id,
                leaveType: 'sick',
                startDate: new Date('2024-11-10'),
                endDate: new Date('2024-11-11'),
                days: 2,
                reason: 'Flu dan demam',
                status: 'approved',
                approvedBy: admin.id,
                approvedAt: new Date('2024-11-10'),
            },
        }),
        // Jane's leaves
        prisma.leaveRequest.create({
            data: {
                userId: users[1].id,
                leaveType: 'personal',
                startDate: new Date('2024-12-27'),
                endDate: new Date('2024-12-28'),
                days: 2,
                reason: 'Mengurus dokumen penting',
                status: 'pending',
            },
        }),
        prisma.leaveRequest.create({
            data: {
                userId: users[1].id,
                leaveType: 'annual',
                startDate: new Date('2024-10-15'),
                endDate: new Date('2024-10-17'),
                days: 3,
                reason: 'Pernikahan saudara',
                status: 'approved',
                approvedBy: admin.id,
                approvedAt: new Date('2024-10-14'),
            },
        }),
        // Bob's leaves
        prisma.leaveRequest.create({
            data: {
                userId: users[2].id,
                leaveType: 'sick',
                startDate: new Date('2024-12-05'),
                endDate: new Date('2024-12-05'),
                days: 1,
                reason: 'Check-up kesehatan rutin',
                status: 'rejected',
                approvedBy: admin.id,
                approvedAt: new Date('2024-12-04'),
                rejectionReason: 'Tidak dapat disetujui untuk alasan check-up, silakan ajukan cuti tahunan',
            },
        }),
        prisma.leaveRequest.create({
            data: {
                userId: users[2].id,
                leaveType: 'annual',
                startDate: new Date('2025-01-02'),
                endDate: new Date('2025-01-03'),
                days: 2,
                reason: 'Perpanjangan libur tahun baru',
                status: 'pending',
            },
        }),
    ]);
    console.log('✅ Created', leaveRequests.length, 'leave requests');

    console.log('\n📊 Seed Summary:');
    console.log('   - 1 Admin user (admin / admin123)');
    console.log('   - 3 Regular users (john, jane, bob / user123)');
    console.log('   - 6 Leave requests (pending, approved, rejected)');
    console.log('\n🎉 Database seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
