import {Space, Tag} from "antd"
import Icons from "../Icons/Icons"
import * as colors from "@ant-design/colors"

function __Tag({item: obj}) {
    const CpnIcon = Icons[obj.icon] ?? (() => <></>)
    return (
        <Tag icon={<CpnIcon/>} color={obj.color}>
            {obj.name}
        </Tag>
    )
}

function __SelectOption({item: obj}) {
    const CpnIcon = Icons[obj.icon]
    return (
        <Space direction={"horizontal"} style={{color: colors[obj.color].primary}}>
            <CpnIcon/>
            {obj.name}
        </Space>
    )
}

function getSelectOptions(obj) {
    return {
        value: obj.key,
        label: <TransactionType.SelectItem item={obj}/>
    }
}

const TransactionType = {
    Tag: __Tag,
    Select: getSelectOptions,
    SelectItem: __SelectOption
}

export default TransactionType