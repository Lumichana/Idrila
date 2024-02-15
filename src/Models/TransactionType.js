import {v4} from 'uuid'

class TransactionType {

    key
    name
    color
    icon

    constructor(key, name, icon, color) {
        this.key = key ?? v4()
        this.name = name
        this.icon = icon
        this.color = color
    }

    static fromDTO(obj) {
        return new TransactionType(
            obj.key,
            obj.name,
            obj.icon,
            obj.color
        )
    }

    toDTO() {
        return {
            key: this.key,
            name: this.name,
            icon: this.icon,
            color: this.color
        }
    }

}

export default TransactionType