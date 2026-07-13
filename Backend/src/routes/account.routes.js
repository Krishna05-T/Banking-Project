import { Router } from "express"
import { JWTVerify } from "../middleware/auth.middleware.js"
import { createAccount } from "../controller/account.controller.js"

const router = Router()


router.route("/create-account").post(JWTVerify, createAccount)

export default router