import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        unique: [true, 'Email is already exist'],
        //for check email format we use email regex by match in schema
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please fill a valid email address']
    },
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "6 character atleast required"],
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function () {
    if(!this.isModified("password"))  return

    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
    
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign({
        _id : this._id,
        email : this.email,
        name : this.name,
    }, process.env.ACCESS_TOKEN, 
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE
    })
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({
        _id : this._id
    },
    process.env.REFRESH_TOKEN,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE
    }
)
}

export const User = mongoose.model("users", userSchema)