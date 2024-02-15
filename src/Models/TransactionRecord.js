import dayjs from "dayjs"
import {v4} from 'uuid'
import TransactionType from "./TransactionType";
import Currency from "./Currency";

class TransactionRecord {

    key
    entity
    isExpense
    type
    date
    currency
    amount
    details

    constructor(key, entity, isExpense, type, date, currency, amount, details) {
        this.key = key ?? v4()
        this.entity = entity
        this.isExpense = isExpense ?? true
        this.type = type
        this.date = date ? dayjs(date, "YYYY-MM-DD") : dayjs()
        this.currency = currency
        this.amount = amount
        this.details = details
    }

    static fromDTO(obj) {
        return new TransactionRecord(
            obj.key,
            obj.entity,
            obj.isExpense === 1,
            obj.type,
            dayjs(obj.date, "YYYY-MM-DD"),
            obj.currency,
            obj.amount,
            obj.details
        )
    }

    toDTO() {
        return {
            key: this.key,
            entity: this.entity,
            isExpense: this.isExpense ? 1 : 0,
            type: Object.assign(new TransactionType(), this.type ?? {}).toDTO(),
            date: this.date.format("YYYY-MM-DD"),
            currency: Object.assign(new Currency(), this.currency ?? {}).toDTO(),
            amount: this.amount,
            details: this.details
        }
    }

}

export default TransactionRecord