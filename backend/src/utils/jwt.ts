import jwt from "jsonwebtoken";

export function getJwtSecret(): string {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }
    return JWT_SECRET;
}

export function validateJwtConfig() {
    getJwtSecret();
}

export function generateToken(user: { userId: number, username: string }) {
    return jwt.sign(user, getJwtSecret());
}

export function verifyToken(token: string) {
    return jwt.verify(token, getJwtSecret());
}