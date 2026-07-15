import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Ledger must be associated with an account"],
        index: true,
        immutable: true
    },
    ammount: {
        type: Number,
        required: [true, "Ammout is required creating a transaction"],
        immutable: true
    },
    transaction: {
        type: String,
        required: [true, "Ledger must be associated with a transaction"],
        index: true,
        immutable: true
    },
    type: {
        type: String,
        enum: {
            values: ["CREDIT", "DEBIT"],
            message: "value  either can be CREDIT or DEBIT"
        },
        required: [true, "Ledger type is required"],
        immutable: true
    }
})

function preventLedgerModification() {
    throw new Error("Ledger entries are immutable and cannot be modified or deleted")
}

ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace',preventLedgerModification)
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification)
ledgerSchema.pre('updateOne', preventLedgerModification)
ledgerSchema.pre('updateMany', preventLedgerModification)
ledgerSchema.pre('deleteMany', preventLedgerModification)
ledgerSchema.pre('deleteOne', preventLedgerModification)
ledgerSchema.pre('remove', preventLedgerModification)

export const Ledger = mongoose.model("ledgers", ledgerSchema)
