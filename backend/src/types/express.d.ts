import "express";

declare module "express-serve-static-core" {
    interface Request {
        id: number;
        username: string;
    }
}