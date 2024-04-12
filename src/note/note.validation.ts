import { object, string, z, ZodType } from 'zod';

export class NoteValidation {
  static readonly CREATE: ZodType = z.object({
    title: z.string().min(1).max(255),
    body: z.string().max(4_294_967_295),
    tags: z.array(
      object({
        id: string(),
      }),
    ),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.string(),
    title: z.string().min(1).max(255),
    body: z.string().max(4_294_967_295),
    tags: z.array(
      object({
        id: string(),
      }),
    ),
  });
}
