import { Router } from "express";
import { userlogin, userlogout, userRegister } from "../controller/user.controller.js";
import { JWTVerify } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register").post(userRegister)
router.route("/login").post(userlogin)
router.route("/logout").post(JWTVerify, userlogout)

export default router