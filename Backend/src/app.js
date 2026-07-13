import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import accountRouter from "./routes/account.routes.js"
import transactionRouter from "./routes/transaction.route.js"

const app = express()
app.use(express.json({limit: "20kb"}))
app.use(express.urlencoded({extended: true, limit:"20kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
}));


app.use("/api/v1/users", userRouter)
app.use("/api/v1/accounts", accountRouter)
app.use("/api/v1/payment", transactionRouter)

export default app;