import type { LeaveStatus, LeaveType } from './user.entity.js';

export interface LeaveRequestEntity {
    id: number;
    userId: number;
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string;
    status: LeaveStatus;
    approvedBy: number | null;
    approvedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface LeaveRequestWithUser extends LeaveRequestEntity {
    user: {
        id: number;
        name: string;
        department: string | null;
    };
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    annual: 'Cuti Tahunan',
    sick: 'Cuti Sakit',
    personal: 'Cuti Pribadi',
    maternity: 'Cuti Melahirkan',
    other: 'Lainnya',
};

export const getLeaveTypeLabel = (type: LeaveType): string => {
    return LEAVE_TYPE_LABELS[type] || type;
};
