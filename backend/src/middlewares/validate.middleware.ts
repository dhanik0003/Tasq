import { Request, NextFunction, RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { z } from "zod";
import { AppError } from "../errors/AppError.js";

export function validate<
    P extends ParamsDictionary = ParamsDictionary
>(schema: z.ZodType): RequestHandler<P> {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const message = result.error.issues
                .map((issue) => issue.message)
                .join(", ");

            return next(new AppError(message, 400));
        }

        req.body = result.data;
        return next();
    };
}