import z from "zod";

export const todoSchema = z.object({
    title: z.string().trim().min(2).max(30),
    description: z.string().trim().max(100).optional()
}).strict();

export const updateTodoStatusSchema = z.object({
    done: z.boolean()
}).strict();

export const replaceTodoSchema = z.object({
    title: z.string().trim().min(2).max(30),
    description: z.string().trim().max(100).nullable(),
}).strict();