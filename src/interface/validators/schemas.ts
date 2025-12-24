import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().min(1, 'Username wajib diisi'),
    password: z.string().min(1, 'Password wajib diisi'),
});

export const createLeaveSchema = z.object({
    leave_type: z.enum(['annual', 'sick', 'personal', 'maternity', 'other'], {
        errorMap: () => ({ message: 'Jenis cuti tidak valid' }),
    }),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
    days: z.number().min(1, 'Jumlah hari minimal 1'),
    reason: z.string().min(1, 'Alasan wajib diisi'),
});

export const rejectLeaveSchema = z.object({
    rejection_reason: z.string().min(1, 'Alasan penolakan wajib diisi'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type RejectLeaveInput = z.infer<typeof rejectLeaveSchema>;
