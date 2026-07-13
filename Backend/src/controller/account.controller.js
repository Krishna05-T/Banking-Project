import { Account } from "../models/account.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const createAccount = AsyncHandler(async (req, res) => {
    const user = req.user

    const account = await Account.create({
        user
    })

    return res
    .status(201)
    .json(
        new ApiResponse(200, "Account created successfully", account)
    )
})

export {
    createAccount
}