import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Account } from "../models/account.model.js";
import { sendTransactionEmail } from "../service/email.service.js";
import { Transaction } from "../models/transcation.model.js";
import mongoose from "mongoose";
import { Ledger } from "../models/ledger.model.js";

/**
 * THE 10-STEP TRANSFER FLOW
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction {PENDING}
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

const createTransaction = AsyncHandler(async (req, res) => {

    /**
     * 1. Validate request
     */

    const { fromAccount, toAccount, amount, idempotencKey } = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencKey) {
        throw new ApiError(400, "All field are required in transaction")
    }

    const fromUserAccount = await Account.findOne({
        _id: fromAccount
    })

    const toUserAccount = await Account.findOne({
        _id: toAccount
    })

    if(!fromUserAccount || !toUserAccount) {
        return res.status(400).json(
            new ApiResponse(400, "Invalid fromAccount or toAccount")
        )
    }

    /**
     * 2. Validate idempotency key
     */

    const isTransactionAlreadyExists = await Transaction.findOne({
        idempotencKey: idempotencKey
    })

    if(isTransactionAlreadyExists) {
        if(isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json(
                new ApiResponse(200, "Transaction already processed", isTransactionAlreadyExists)
            )
        }

        if(isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json(
                new ApiResponse(200, "Transaction is still processing", {})
            )
        }

        if(isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json(
                new ApiResponse(500, "Transaction failed")
            )
        }

        if(isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json(
                new ApiResponse(500, "Transaction reversed")
            )
        }
    }

    /**
     * 3. Check account status
     */

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json(
            new ApiResponse(400, "Both fromAccount and toAccount must be ACTIVE to process transaction", {})
        )
    }


    /**
     * 4. Derive sender balance from ledger
     */

    const balance = await fromUserAccount.getBalance()

    if(balance < amount) {
        return res.status(400).json(new ApiResponse(400, `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`) )
    }


    /**
     * 5.  Create transaction {PENDING}
     */

    const session = await mongoose.startSession()
    // we want 5,6,7,8 step done in once with getting error if error occure in one step all the step was revert this is done by with the help of startTransaction
    session.startTransaction()
    
    const transaction = await Transaction.create({
        fromAccount,
        toAccount,
        amount,
        idempotencKey,
        status: "PENDING"
    }, { session })

    const debitLedgerEntry = await Ledger.create({
        account: fromAccount,
        ammount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    }, { session })

    const creditLedgerEntry = await Ledger.create({
        account: toAccount,
        ammount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }, { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    /**
   * 10. Send email notification
   */

  await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)


  return res
  .status(200)
  .json(
    new ApiResponse(200, "Transaction create sucessfully", transaction)
  )
})

const createInitialFundsTransaction = AsyncHandler(async (req, res) => {
    const {toAccount, amount, idempotencKey} = req.body;

    if(!toAccount || !amount || !idempotencKey) {
        throw new ApiError(400, "All field are required")
    }

    const toUserAccount = await Account.findOne({
        _id: toAccount
    })

    if(!toUserAccount) {
        throw new ApiError(400, "Invalid toAccount")
    }

    const fromUserAccount = await Account.findOne({
        systemUser: true,
        user: req.user._id
    })

    if(!fromUserAccount) {
        throw new ApiError(400, "System user account not found")
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = await Transaction.create({
        fromAccount: fromUserAccount,
        toAccount,
        amount,
        idempotencKey,
        status: "PENDING",
    }, { session })
    
    const debitLedgerEntry = await Ledger.create({
        account: fromUserAccount._id,
        ammount: amount,
        transaction: transaction._id,
        type: "DEBIT"
        
    }, {session })

    const creditLedgetEntry = await Ledger.create({
        account: toAccount._id,
        ammount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    }, { session })

     transaction.status = "COMPLETED"
     await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Initail transaction is successfull ", transaction)
    )
})


export {
    createTransaction,
    createInitialFundsTransaction
}


