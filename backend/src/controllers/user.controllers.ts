import { createUser, checkUser } from "../services/auth.services.js"
import { generateToken } from "../utils/jwt.js"
import { Request, Response, NextFunction } from "express";

export async function signupController(req: Request, res: Response) {
    const fullname: string = req.body.fullname;
    const username: string = req.body.username;
    const password: string = req.body.password;

    const user = await createUser(fullname, username, password);

    res.status(201).json({
        message: "User Created",
        response: user
    })
}

export async function signinController(req: Request, res: Response) {
    const username: string = req.body.username;
    const password: string = req.body.password;

    const user = await checkUser(username, password);

    if (!user) {
        return res.status(401).json({
            message: "Invalid username or password",
        });
    }


    const token = generateToken({
        userId: user.id,
        username: user.username
    })

    res.status(200).json({
        message: "User signed in blud!",
        User: user,
        token: token
    })
}