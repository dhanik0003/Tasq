import "dotenv/config";
import app from "./app.js";
import { validateJwtConfig } from "./utils/jwt.js";

const PORT = process.env.PORT || 3000;

validateJwtConfig();

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})