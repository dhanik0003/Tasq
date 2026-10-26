import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { todoSchema, updateTodoStatusSchema, replaceTodoSchema } from "../schemas/todo.schema.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createTodo, findTodos, findTodo, editTodo, updateTodo, deleteTodo } from "../controllers/todo.controllers.js";
import { TodoParams } from "../types/todo.types.js"

const router = Router();

router.post("/todos", authMiddleware, validate(todoSchema), createTodo);
router.get("/todos", authMiddleware, findTodos);
router.get("/todos/:id", authMiddleware, findTodo);
router.put<TodoParams>("/todos/:id", authMiddleware, validate<TodoParams>(replaceTodoSchema), editTodo);
router.patch<TodoParams>("/todos/:id", authMiddleware, validate<TodoParams>(updateTodoStatusSchema), updateTodo);
router.delete("/todos/:id", authMiddleware, deleteTodo);

export default router;