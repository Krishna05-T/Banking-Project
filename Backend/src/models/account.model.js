import mongoose from "mongoose"
import { Ledger } from "./ledger.model.js"

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        index: true         //  study b+ tree
    },
    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status can be either ACTIVE, FROZEN and CLOSED",
        },
        default: "ACTIVE"
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

accountSchema.methods.getBalance = async function() {
    const balanceData = await Ledger.aggregate([
        { $match: { account: this._id} },
        {
            $group:{
                _id: null,
                totalDebit:{
                    $sum:{
                        $cond:[
                            {$eq: ["$type", "DEBIT"]}, "$amount", 0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "CREDIT"]}, "$amount", 0
                        ]
                    }
                }
            }
        },

        {
            $project: {
                _id: 0,
                balance: { $subtract: ["$totalCredit", "$totalDebit"]}
            }
        }
    ])

    // for new account 
    if(balanceData.length === 0) {
        return 0
    }
    
    return balanceData[0].balance
}

export const Account = mongoose.model("accounts", accountSchema)
