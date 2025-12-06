import { z } from "zod";

// Entry validation schema
export const entrySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().min(1, "Middle name is required"),
  surname: z.string().min(1, "Surname is required"),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Gender must be male or female" }),
  }),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"], {
    errorMap: () => ({ message: "Invalid marital status" }),
  }),
  religion: z.string().min(1, "Religion is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  occupation: z.string().min(1, "Occupation is required"),
  bp: z.string().optional().nullable(),
  temp: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(parseFloat(val)),
      "Temperature must be a number"
    )
    .transform((val) => (val ? parseFloat(val) : null)),
  weight: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || !isNaN(parseFloat(val)),
      "Weight must be a number"
    )
    .transform((val) => (val ? parseFloat(val) : null)),
  diagnosis: z.string().optional().nullable(),
  treatment: z.string().optional().nullable(),
});

// Entry query parameters schema
export const entryQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 50)),
  gender: z.enum(["male", "female"]).optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  minAge: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  maxAge: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
  minWeight: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxWeight: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  minBp: z.string().optional(),
  maxBp: z.string().optional(),
  search: z.string().optional(),
});

// Stats query parameters schema
export const statsQuerySchema = z.object({
  gender: z.enum(["male", "female"]).optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
});

// Analytics query parameters schema
export const analyticsQuerySchema = z.object({
  gender: z.enum(["male", "female"]).optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
});

// Auth credentials schema
export const authCredentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type EntryInput = z.infer<typeof entrySchema>;
export type EntryQuery = z.infer<typeof entryQuerySchema>;
export type StatsQuery = z.infer<typeof statsQuerySchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type AuthCredentials = z.infer<typeof authCredentialsSchema>;

