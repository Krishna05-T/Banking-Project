import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token are required"]
    }
},{ timestamps: true })

export const Blacklist = mongoose.model("blacklists", blackListSchema)