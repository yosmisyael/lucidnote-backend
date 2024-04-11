import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    email: z.string().email().min(1).max(255),
    name: z.string().min(1).max(255),
    username: z.string().min(1).max(255),
    password: z.string().min(1).max(100),
  });
}
