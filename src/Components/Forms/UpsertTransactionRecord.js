import Components from "../Components/Components"
import Icons from "../Icons/Icons"
import TransactionRecord from "../../Models/TransactionRecord"
import locale from "../../Static/Config/Locale/content.json"
import req from "../../Connector/WebConnector"
import {App, AutoComplete, Button, DatePicker, Form, Input, Modal, Select, Space} from "antd"
import {AppConfig} from "../../App"
import {useContext, useEffect, useState} from "react"

function UpsertTransactionRecord({arrEntities, data, onClose, onSubmit, open,}) {

    const {modal, message} = App.useApp()

    const {arrCurrencies, arrTypes, config} = useContext(AppConfig)

    const [objRecord, _objRecord] = useState(data ?? new TransactionRecord())

    const initForm = () => {
        if (!objRecord.currency) updateForm("currency", arrCurrencies.find(obj => obj.isPrimary))
    }

    const refreshForm = () => {
        _objRecord(prevState => {
            const newState = new TransactionRecord()
            newState.type = prevState.type
            newState.date = prevState.date
            newState.isExpense = prevState.isExpense
            newState.currency = prevState.currency
            return newState
        })
    }

    const updateForm = (key, value) => {
        _objRecord(prevState => {
            const newState = Object.assign(new TransactionRecord(), prevState)
            newState[key] = value
            return newState
        })
    }

    const submitForm = () => {
        const strError = validateForm()
        if (strError === "") {
            req.upsertTransactionRecord(objRecord)
                .then(() => {
                    const objModal = modal.success({
                        title: locale[config.locale].msg.saved,
                        centered: true,
                        footer: (_, {OkBtn}) => (
                            <>
                                <Button
                                    onClick={() => {
                                        refreshForm()
                                        objModal.destroy()
                                    }}
                                >
                                    {locale[config.locale].button.another_record}
                                </Button>
                                <OkBtn/>
                            </>
                        ),
                        onOk: onClose
                    })
                    onSubmit(objRecord)
                })
        } else {
            message.error(strError)
        }
    }

    const validateForm = () => {
        if (!objRecord.entity) {
            return locale[config.locale].msg.record_no_entity
        }
        if (!objRecord.type) {
            return locale[config.locale].msg.record_no_type
        }
        if (!objRecord.amount || isNaN(objRecord.amount)) {
            return locale[config.locale].msg.record_invalid_number
        }
        return ""
    }

    const matchEntity = value => value.value.toLowerCase().includes(objRecord.entity?.toLowerCase() ?? "")

    useEffect(() => {
        _objRecord({
            ...data,
            currency: data.currency ?? arrCurrencies.find(obj => obj.isPrimary)
        })
        // initForm()
    }, [data])

    return (
        <Modal className={"Form_UpsertTransactionRecord"}
               cancelText={locale[config.locale].button.cancel}
               centered
               closeIcon={false}
               okText={locale[config.locale].button.submit}
               onCancel={onClose}
               onOk={submitForm}
               open={open}
        >
            <Form colon={false} labelCol={{span: 3}} labelWrap style={{marginTop: "10px"}} wrapperCol={{span: 21}}>
                <Form.Item label={locale[config.locale].label.entity}>
                    <AutoComplete
                        options={arrEntities.filter(matchEntity)}
                        value={objRecord.entity}
                        onChange={value => updateForm("entity", value)}
                        allowClear
                    />
                </Form.Item>
                <Form.Item label={locale[config.locale].label.type}>
                    <Space.Compact style={{width: "100%"}}>
                        <Button onClick={() => updateForm("isExpense", !objRecord.isExpense)} style={{width: "20%"}}>
                            {objRecord.isExpense ? locale[config.locale].label.expense : locale[config.locale].label.income}
                        </Button>
                        <Select
                            options={arrTypes.map(Components.TransactionType.Select)}
                            value={objRecord.type?.key}
                            allowClear={false}
                            onChange={value => updateForm("type", arrTypes.find(obj => obj.key === value))}
                        />
                        <Button onClick={global.openModalManageTypes} icon={<Icons.UI.PriceTag/>}/>
                    </Space.Compact>
                </Form.Item>
                <Form.Item label={locale[config.locale].label.date}>
                    <DatePicker
                        format={"YYYY-MM-DD"}
                        value={objRecord.date}
                        onChange={value => updateForm("date", value)}
                        allowClear={false}
                    />
                </Form.Item>
                <Form.Item label={locale[config.locale].label.amount}>
                    <Space.Compact style={{width: "100%"}}>
                        <Button onClick={global.openModalManageCurrency} icon={<Icons.UI.Currency/>}/>
                        <Select
                            style={{width: "300%"}}
                            options={arrCurrencies.map(Components.Currency.Select)}
                            value={objRecord.currency?.code}
                            onChange={value => updateForm("currency", arrCurrencies.find(obj => obj.code === value))}
                        />
                        <Input
                            style={{textAlign: "right"}}
                            value={objRecord.amount}
                            onChange={event => updateForm("amount", event.target.value)}
                        />
                    </Space.Compact>
                </Form.Item>
                <Form.Item label={locale[config.locale].label.details}>
                    <Input.TextArea
                        maxLength={100}
                        showCount
                        style={{height: 120, resize: "none"}}
                        value={objRecord.details}
                        onChange={event => updateForm("details", event.target.value)}
                    />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default UpsertTransactionRecord
