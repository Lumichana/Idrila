class Currency {

    name
    code
    rate
    isPrimary

    constructor(name, code, rate, isPrimary) {
        this.name = name
        this.code = code
        this.rate = rate
        this.isPrimary = isPrimary
    }

    static fromDTO(obj) {
        return new Currency(
            obj.name,
            obj.code,
            obj.rate,
            obj.isPrimary === 1
        )
    }

    toDTO() {
        return {
            name: this.name,
            code: this.code,
            rate: this.rate,
            isPrimary: this.isPrimary ? 1 : 0
        }
    }
}

export default Currency