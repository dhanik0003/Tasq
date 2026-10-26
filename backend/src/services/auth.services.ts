import prisma from "../prisma.js";
import { Prisma } from "../../generated/prisma/client.js"
import { comaprePassword } from "../utils/hashpwd.js";
import { hashPassword } from "../utils/hashpwd.js";
import { AppError } from "../errors/AppError.js";

export async function createUser(fullname: string, username: string, password: string) {
    const hashedPassword = await hashPassword(password);
    try {

        const response = await prisma.user.create({
            data: {
                fullname: fullname,
                username: username,
                password: hashedPassword
            },
            select: {
                id: true,
                fullname: true,
                username: true
            }
        });
        return response
    }
    catch (err: any) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            throw new AppError("Username alraedy exists", 409);
        }
        throw err;
    }
}

export async function checkUser(username: string, password: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            },
            select: {
                id: true,
                fullname: true,
                username: true,
                password: true
            }
        });
        if (user) {
            const isValid = await comaprePassword(password, user.password);
            if (!isValid) return null;
            return {
                id: user.id,
                fullname: user.fullname,
                username: user.username
            }
        }
    }
    catch (err: any) {
        throw (err);
    }
}