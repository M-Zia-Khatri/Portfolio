import { z } from 'zod';

export const contactSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
