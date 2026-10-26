import prisma from "../prisma.js";
import { AppError } from "../errors/AppError.js";
import { Prisma } from "../../generated/prisma/client.js"

export async function createTodoService(userId: number, title: string, description: string | undefined) {

    const todo = await prisma.todo.create({
        data: {
            title: title,
            description: description,
            userId: userId
        },
        select: {
            id: true,
            title: true,
            description: true,
            done: true,
            createdAt: true
        }
    });
    return todo;


}

export async function findTodosService(userId: number) {

    const todos = await prisma.todo.findMany({
        where: {
            userId: userId
        },
        select: {
            id: true,
            title: true,
            done: true,
            createdAt: true
        }
    })
    return todos;

}

export async function findTodoService(userId: number, todoId: number) {
    const todo = await prisma.todo.findUnique({
        where: {
            id: todoId,
            userId: userId
        },
        select: {
            id: true,
            title: true,
            description: true,
            done: true,
            createdAt: true
        }
    })
    if (!todo) {
        throw new AppError("Todo not found", 404)
    }
    return todo;
}

export async function editTodoService(userId: number, todoId: number, title: string, description: string | null) {
    try {
        const todo = await prisma.todo.update({
            where: {
                id: todoId,
                userId: userId
            },
            data: {
                title: title,
                description: description
            },
            select: {
                id: true,
                title: true,
                description: true,
                done: true,
                createdAt: true
            }
        })
        return todo;
    }
    catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            throw new AppError("Todo not found", 404);
        }
        throw err;
    }
}

export async function updateTodoService(userId: number, todoId: number, done: boolean) {
    try {
        const todo = await prisma.todo.update({
            where: {
                id: todoId,
                userId: userId
            },
            data: {
                done: done
            },
            select: {
                id: true,
                title: true,
                description: true,
                done: true,
                createdAt: true
            }
        });
        return todo;
    }
    catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            throw new AppError("Todo not found", 404);
        }
        throw err;
    }
}

export async function deleteTodoService(userId: number, todoId: number) {
    try {
        const todo = await prisma.todo.delete({
            where: {
                id: todoId,
                userId: userId
            },
            select: {
                id: true,
                title: true,
                description: true,
                done: true,
                createdAt: true
            }
        });
        return todo;
    }
    catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
            throw new AppError("Todo not found", 404);
        }
        throw err;
    }
}