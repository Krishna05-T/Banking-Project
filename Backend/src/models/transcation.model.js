import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "From account is required"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        require: [true, "To account is required"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "status must be either PENDING, COMPLETED, FAILED and REVERSED"
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Amount is requried for creating a transaction"],
        min: [0, "Transaction amount cannot be zero"]
    },
    idempotencKey: {
        type: String,
        required: [true, "Idempotency key is required for createing a transaction"],
        index: true,
        unique: true
    }
} ,{
    timestamps: true
})


export const Transaction = mongoose.model("transactions", transactionSchema)
