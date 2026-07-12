import { User } from "../models/user.model.js"
import { Blacklist } from "../models/blacklist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { sendEmailService } from "../service/email.service.js";


const  generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
    
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(400, error.message)
    }
}

const userRegister = AsyncHandler(async (req, res) => {
    const {email, name, password} = req.body;

    if(
        [email, name, password].some((field) => !field || field.trim() === "") 
    ) {
        throw new ApiError(400, "all field are required")
    }

    if(!email.includes("@")) {
        throw new ApiError(400, "Email is invalid")
    }

    const existingUser = await User.findOne({email : email})

    if(existingUser) {
        throw new ApiError(400, " Email is already register ")
    }

    const user = await User.create({
        email,
        name,
        password
    })

    const createUser = await User.findById(user._id).select("-refreshToken")

    if(!createUser) {
        throw new ApiError(400, "User is not create in database")
    }

    await sendEmailService(createUser.email, createUser.name)

    return res
    .status(200)
    .json(
        new ApiResponse(200, "User register successfully ", createUser)
    )
})

const userlogin = AsyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if( [email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, " All field are required ")
    }

    const user = await User.findOne({email: email});

    if(!user) {
        throw new ApiError(400, "User not found")
    }

    const result = await user.checkPassword(password)

    if(!result) {
        throw new ApiError(400, " Password is incorrect")
    }

    const loggedInUser = await User.findById(user._id).select("-password")
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    const option = {
        httpOnly : true,
        secure: process.env.NODE_ENV = "production",
        sameSites: process.env.NODE_ENV= "production" ? "none" : "lax"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(200, "User login successfully ", { loggedInUser, accessToken, refreshToken })
    )
})

const userlogout = AsyncHandler(async (req, res) => {
    await User.findOneAndUpdate(
        req.user, 
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const token = await req.user?.accessToken;

    if(token) {
        await Blacklist.create({token})
    }

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV = "production",
        sameSites: process.env.NODE_ENV = "production" ? "none" : "lax"
    }

    return res
    .status(200)
    .cookie("accessToken", option)
    .cookie("refreshToken", option)
    .json(
        new ApiResponse(200, "User logout successfully", {})
    )
})

export {
    userRegister,
    userlogin,
    userlogout
}
