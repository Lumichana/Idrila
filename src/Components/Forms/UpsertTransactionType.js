import Icons from "../Icons/Icons"
import Modal from "antd/es/modal/Modal"
import ScrollArea from "../Containers/ScrollArea"
import TransactionType from "../../Models/TransactionType"
import colors from "../../Static/Config/Color/Color"
import locale from "../../Static/Config/Locale/content.json"
import req from "../../Connector/WebConnector"
import {App, Button, Card, ConfigProvider, Form, Input, Select, Space, theme} from "antd"
import {AppConfig} from "../../App"
import {useContext, useEffect, useState} from "react"

function UpsertTransactionType({open, onClose, data, onSubmit}) {

    const {message} = App.useApp()

    const {token} = theme.useToken()

    const {arrTypes, config} = useContext(AppConfig)

    const [objType, _objType] = useState(data ?? new TransactionType())

    const updateForm = (strKey, strValue) => {
        _objType(prevState => {
            const newState = new TransactionType()
            for (const prop in prevState) {
                newState[prop] = prevState[prop]
            }
            newState[strKey] = strValue
            return newState
        })
    }

    const submitForm = () => {
        const strError = validateForm()
        if (strError === "") {
            req.upsertTransactionType(objType)
                .then(() => {
                    onSubmit(objType)
                    onClose()
                })
                .then(global.refreshView)
        } else {
            message.error(strError)
        }
    }

    const validateForm = () => {
        if (!objType.name) {
            return locale[config.locale].msg.type_no_name
        }
        if (arrTypes.find(obj => obj.name === objType.name && obj.key !== objType.key)) {
            return locale[config.locale].msg.type_name_exist
        }
        if (!objType.color) {
            return locale[config.locale].msg.type_no_color
        }
        if (!objType.icon) {
            return locale[config.locale].msg.type_no_icon
        }
        return ""
    }

    const getColorOptions = (strColor) => {
        return {
            value: strColor,
            label: (
                <Space direction="horizontal" style={{color: colors[strColor]}}>
                    <Icons.Paint/>
                    {locale[config.locale].color[strColor]}
                </Space>
            )
        }
    }

    const CpnIconButton = (strName) => {
        let CpnIcon = Icons[strName]
        return (
            <Button
                size="large"
                icon={<CpnIcon/>}
                type={objType?.icon === strName ? "primary" : "default"}
                shape="circle"
                onClick={() => updateForm("icon", strName)}
                style={{margin: "5px"}}
            />
        )
    }

    useEffect(() => {
        _objType(data)
    }, [data])

    return (
        <Modal className={"Form_UpsertTransactionType"}
               open={open}
               closeIcon={false}
               okText={locale[config.locale].button.submit}
               cancelText={locale[config.locale].button.cancel}
               onCancel={onClose}
               onOk={submitForm}
               centered
               zIndex={1002}
        >
            <Form labelCol={{span: 3}} wrapperCol={{span: 21}} labelWrap labelAlign={"left"} colon={false} style={{marginTop: "10px"}}>
                <Form.Item label={locale[config.locale].label.name}>
                    <Input value={objType?.name} onChange={event => updateForm("name", event.target.value)}/>
                </Form.Item>
                <Form.Item label={locale[config.locale].label.color}>
                    <Select onChange={value => updateForm("color", value)} options={Object.keys(colors).map(getColorOptions)} value={objType.color}/>
                </Form.Item>
                <Form.Item label={locale[config.locale].label.icon}>
                    <Card style={{borderColor: "#d9d9d9"}} bodyStyle={{padding: "5px"}}>
                        <ConfigProvider theme={{token: {colorPrimary: colors[objType?.color] ?? token.colorPrimary}}}>
                            <ScrollArea height={"200px"}>
                                {Object.keys(Icons).filter(value => value !== "UI").map(CpnIconButton)}
                            </ScrollArea>
                        </ConfigProvider>
                    </Card>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default UpsertTransactionType