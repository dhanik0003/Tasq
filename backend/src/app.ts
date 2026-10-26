import express from "express";
import userRouter from "./routes/user.routes.js";
import todoRouter from "./routes/todo.routes.js"
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
const app = express();

app.use(express.json());
app.use("/api/v1/user", userRouter);
app.use("/api/v1", todoRouter);

app.use(errorHandler);

export default app;