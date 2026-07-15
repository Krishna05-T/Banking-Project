import { Router } from "express"
import { JWTVerify } from "../middleware/auth.middleware.js"
import { createTransaction } from "../controller/transaction.controller.js"
const router = Router()

router.route("/transaction").post(JWTVerify, createTransaction)

export default router;