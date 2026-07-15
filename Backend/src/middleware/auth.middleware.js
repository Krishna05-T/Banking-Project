import { User } from "../models/user.model.js";
import { Blacklist } from "../models/blacklist.model.js";
import jwt from "jsonwebtoken"
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const JWTVerify = AsyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    
        if(!token) {
            throw new ApiError(400, "token not found")
        }
    
        const blacklistToken = await Blacklist.findOne({token})
    
        if(blacklistToken) {
            throw new ApiError(400, "Token is invalid")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN)
        const user = await User.findById(decodedToken._id)
    
        if(!user) {
            throw new ApiError(400, "user not found")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(error.statusCode, `Error occure in JWTVerify ${error.message}`)
    }
}) 

export const AuthSystemUser = AsyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")

    if(!token) {
        throw new ApiError(400, "Token not found")
    }

   try {
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN)
     const user = await User.findById(decodedToken._id).select("+systemUser")
 
      if(!user) {
         throw new ApiError(400, "User not auth")
     }
 
     
     if(!user.systemUser) {
         throw new ApiError(403, "User is foribid ")
     }
     
     req.user = user
     next()
   } catch (error) {
        throw new ApiError(400, `error in auth system user ${error.message}`)
   }
   
})