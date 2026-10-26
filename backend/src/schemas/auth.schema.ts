import z from "zod";

export const signupSchema = z.object({
    fullname: z.string().trim().min(2),
    username: z.string().trim().min(3, "Username must at least 3 characters").max(30, "Username must at most 30 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can contain only letters, numbers, underscore"),
    password: z.string().min(8)
}).strict();

export const signinSchema = z.object({
    username: z.string().trim().min(3).max(30, "Username must at most 30 characters").regex(/^[a-zA-Z0-9_]+$/, "Username can contain only letters, numbers, underscore"),
    password: z.string().min(1)
}).strict();