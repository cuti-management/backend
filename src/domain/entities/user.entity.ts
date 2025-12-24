export type UserRole = 'admin' | 'user';
export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface UserEntity {
    id: number;
    username: string;
    password: string;
    name: string;
    email: string;
    role: UserRole;
    department: string | null;
    position: string | null;
    annualLeaveQuota: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserPublic {
    id: number;
    username: string;
    name: string;
    email: string;
    role: UserRole;
    department: string | null;
    annualLeaveQuota: number;
}

export const toUserPublic = (user: UserEntity): UserPublic => ({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    department: user.department,
    annualLeaveQuota: user.annualLeaveQuota,
});
