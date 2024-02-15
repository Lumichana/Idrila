import TransactionRecord from "../Models/TransactionRecord";
import TransactionType from "../Models/TransactionType";
import Currency from "../Models/Currency";

function POSTRequestOptions(data) {
    let myHeaders = new Headers()
    myHeaders.append("Content-Type", "application/json");
    return {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data),
        redirect: 'follow'
    }
}

function toDTO(data, ClassType) {
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            data[i] = Object.assign(new ClassType(), data[i]).toDTO()
        }
    } else {
        data = [Object.assign(new ClassType(), data).toDTO()]
    }
    return data
}

function toArray(data) {
    if (Array.isArray(data)) {
        return data
    } else {
        return [data]
    }
}

function arrayToObject(arr) {
    const obj = {}
    for (let i = 0; i < arr.length; i++) {
        obj[arr[i].key] = arr[i].value
    }
    return obj
}

function objectToArray(obj) {
    return Object.keys(obj).map(key => ({
        key: key,
        value: obj[key]
    }))
}

function getDbConfig() {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}config/db`)
            .then(resp => {
                if (resp.status === 200) {
                    resp.text().then(data => resolve(JSON.parse(data)))
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function updateDbConfig(data) {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}config/db`, POSTRequestOptions(data))
            .then(resp => {
                if (resp.status === 200) {
                    resolve()
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function upsertTransactionRecord(data) {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}record/upsert`, POSTRequestOptions(toDTO(data, TransactionRecord)))
            .then(resp => {
                if (resp.status === 200) {
                    resolve()
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function getTransactionRecord() {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}record/get`)
            .then(resp => {
                if (resp.status === 200) {
                    resp.json().then(data => resolve(data.map(TransactionRecord.fromDTO)))
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function deleteTransactionRecord(keys) {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}record/delete`, POSTRequestOptions(toArray(keys)))
            .then(resp => {
                if (resp.status === 200) {
                    resolve()
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function upsertTransactionType(data) {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}type/upsert`, POSTRequestOptions(toDTO(data, TransactionType)))
            .then(resp => {
                if (resp.status === 200) {
                    resolve()
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function getTransactionType() {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}type/get`)
            .then(resp => {
                if (resp.status === 200) {
                    resp.json().then(data => resolve(data.map(TransactionType.fromDTO)))
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function deleteTransactionType(keys) {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}type/delete`, POSTRequestOptions(toArray(keys)))
            .then(resp => {
                if (resp.status === 200) {
                    resolve()
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function upsertCurrency(data) {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}currency/upsert`, POSTRequestOptions(toDTO(data, Currency)))
            .then(resp => {
                if (resp.status === 200) {
                    resolve()
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function getCurrency() {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}currency/get`)
            .then(resp => {
                if (resp.status === 200) {
                    resp.json().then(data => resolve(data.map(Currency.fromDTO)))
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function upsertConfig(data) {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}config/upsert`, POSTRequestOptions(objectToArray(data)))
            .then(resp => {
                if (resp.status === 200) {
                    resolve()
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

function getConfig() {
    return new Promise((resolve, reject) => {
        fetch(`${global.serverAddress}config/get`)
            .then(resp => {
                if (resp.status === 200) {
                    resp.json().then(data => resolve(arrayToObject(data)))
                } else {
                    resp.text().then(reject)
                }
            })
            .catch(reject)
    })
}

const req = {
    upsertTransactionRecord,
    getTransactionRecord,
    deleteTransactionRecord,
    upsertTransactionType,
    getTransactionType,
    deleteTransactionType,
    upsertCurrency,
    getCurrency,
    upsertConfig,
    getConfig,
    updateDbConfig,
    getDbConfig
}

export default req