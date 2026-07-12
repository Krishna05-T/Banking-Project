import mongoose from "mongoose"

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        index: true         //  study b+ tree
    },
    status: {
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN and CLOSED"
        }
    },
    currency: {
        type: String,
        required: [true, "Currency is required"],
        default: "INR"
    },
}, {
    timestamps: true
})

accountSchema.index({ user: 1, status: 1})

export const account = mongoose.model("accounts", accountSchema)
