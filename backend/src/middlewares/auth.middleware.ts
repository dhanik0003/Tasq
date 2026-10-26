import { verifyToken } from "../utils/jwt.js"

export function authMiddleware(req: any, res: any, next: any) {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({
            message: "You are not logged in or token expired"
        });
    }
    try {
        const decoded = verifyToken(token);
        if (typeof decoded === "string") {
            return res.status(401).json({
                message: "Unauthorised"
            });
        }
        req.id = decoded.userId;
        req.username = decoded.username;
        next();
    }
    catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}