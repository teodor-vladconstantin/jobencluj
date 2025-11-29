import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Parola trebuie să aibă minim 6 caractere'),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(6, 'Parola trebuie să aibă minim 6 caractere'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Numele trebuie să aibă minim 2 caractere'),
  role: z.enum(['candidate', 'employer'], {
    required_error: 'Selectează un rol',
  }),
  companyName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Parolele nu se potrivesc',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'employer') {
    return data.companyName && data.companyName.length >= 2;
  }
  return true;
}, {
  message: 'Numele companiei este obligatoriu pentru angajatori',
  path: ['companyName'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
