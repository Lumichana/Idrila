function __Select(obj) {
    return {
        value: obj.code,
        label: `${obj.name} (${obj.code})`
    }
}


const Currency = {
    Select: __Select
}

export default Currency