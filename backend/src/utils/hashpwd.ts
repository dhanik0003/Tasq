import brcypt from "bcrypt";

export async function hashPassword(password: string): Promise<string> {
    const saltRounds: number = 10;
    const hashedPassword = brcypt.hash(password, saltRounds);
    return hashedPassword;
}

export async function comaprePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await brcypt.compare(password, hashedPassword);
}