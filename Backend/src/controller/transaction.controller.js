import { AsyncHandler } from "../utils/AsyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { Account } from "../models/account.model.js";
import { sendEmailService } from "../service/email.service";
import { Transaction } from "../models/transcation.model.js";

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

    
})

