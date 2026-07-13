import { Router } from "express"
import { JWTVerify } from "../middleware/auth.middleware"

const router = Router()

router.route("/transaction").post(JWTVerify)

export default router;