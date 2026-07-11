import app from "./app.js"
import connectDB from "./db/index.js"
import dotenv from "dotenv"

dotenv.config({
    path: "./.env"
})

connectDB()
.then(() => {
    app.on("error" , (err) => {
        console.log("error raise", err)
    })
    app.listen(process.env.PORT, ()=> {
        console.log(`Server is set up at port ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log(error.message || "server set up failed")
})
