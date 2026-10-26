import { Request, Response, NextFunction, response } from "express";
import { createTodoService, findTodosService, findTodoService, editTodoService, updateTodoService, deleteTodoService } from "../services/todo.services.js";
import { TodoParams } from "../types/todo.types.js";
import { AppError } from "../errors/AppError.js";

function getTodoId(id: string): number {
    const todoId = Number(id);

    if (!Number.isInteger(todoId) || todoId <= 0) {
        throw new AppError("Todo ID must be a positive integer", 400);
    }

    return todoId;
}

export async function createTodo(req: Request, res: Response) {
    const userId = req.id;
    const title = req.body.title;
    const description = req.body.description;

    const todo = await createTodoService(userId, title, description);

    res.status(201).json({
        message: "Todo created!",
        response: todo
    });
}

export async function findTodos(req: Request, res: Response) {
    const userId = req.id;

    const todo = await findTodosService(userId);

    res.status(200).json({
        response: todo
    })
}

export async function findTodo(req: Request<TodoParams>, res: Response) {
    const userId = req.id;
    const todoId = getTodoId(req.params.id);

    const todo = await findTodoService(userId, todoId);

    res.status(200).json({
        response: todo
    })
}

export async function editTodo(req: Request<TodoParams>, res: Response) {
    const userId = req.id;
    const todoId = getTodoId(req.params.id);
    const title = req.body.title;
    const description = req.body.description;

    const todo = await editTodoService(userId, todoId, title, description);

    res.status(200).json({
        message: "Updated",
        response: todo
    });
}

export async function updateTodo(req: Request<TodoParams>, res: Response) {
    const userId = req.id;
    const todoId = getTodoId(req.params.id);
    const done = req.body.done;

    const todo = await updateTodoService(userId, todoId, done);

    res.status(200).json({
        message: "updated",
        response: todo
    })
}

export async function deleteTodo(req: Request<TodoParams>, res: Response) {
    const userId = req.id;
    const todoId = getTodoId(req.params.id);

    const todo = await deleteTodoService(userId, todoId);

    res.status(200).json({
        message: "Deleted",
        response: todo
    })
}