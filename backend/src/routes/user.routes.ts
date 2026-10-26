import { Router } from "express";
import { signupController, signinController } from "../controllers/user.controllers.js";
import { signupSchema, signinSchema } from "../schemas/auth.schema.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.post("/signup", validate(signupSchema), signupController);
router.post("/signin", validate(signinSchema), signinController);

export default router;