import Currency from "../../Models/Currency"
import Icons from "../Icons/Icons"
import ScrollArea from "../Containers/ScrollArea"
import locale from "../../Static/Config/Locale/content.json"
import req from "../../Connector/WebConnector"
import {App, Button, Card, Input, Modal, Space, Tooltip} from "antd"
import {AppConfig} from "../../App"
import {useContext} from "react"

function ManageCurrency({open, onClose}) {

    const {message} = App.useApp()

    const {arrCurrencies, _arrCurrencies, config} = useContext(AppConfig)

    const submitForm = () => {
        const strError = validateForm()
        if (strError === "") {
            req.upsertCurrency(arrCurrencies)
                .then(() => req.getCurrency().then(_arrCurrencies))
                .then(global.refreshData)
            onClose()
        } else {
            message.error(strError)
        }
    }

    const revertForm = () => {
        req.getCurrency().then(_arrCurrencies)
        onClose()
    }

    const updateForm = (index, strKey, strValue) => {
        _arrCurrencies(prevState => {
            if (strKey === "isPrimary") {
                if (prevState.length === 1) {
                    prevState[0].rate = 1
                    prevState[0].isPrimary = true
                } else if (prevState[index].isPrimary !== true) {
                    const numRate = prevState[index].rate
                    for (let i = 0; i < prevState.length; i++) {
                        if (i === index) {
                            prevState[i].rate = 1
                            prevState[i].isPrimary = true
                        } else {
                            prevState[i].rate = (prevState[i].rate / numRate).toFixed(5)
                            prevState[i].isPrimary = false
                        }
                    }
                }
            } else {
                prevState[index][strKey] = strValue
            }
            return [...prevState]
        })
    }

    const validateForm = () => {
        const arrCodes = new Set()
        let intCount = 0
        for (const obj of arrCurrencies) {
            if (!obj.code || !obj.rate) {
                return locale[config.locale].msg.currency_no_code_no_rate
            }
            if (arrCodes.has(obj.code)) {
                return locale[config.locale].msg.currency_code_exist
            }
            arrCodes.add(obj.code)
            if (obj.isPrimary) {
                intCount++
                if (intCount > 1) {
                    return locale[config.locale].msg.currency_too_much_primary
                }
            }
        }
        return intCount === 1 ? "" : locale[config.locale].msg.currency_no_primary
    }

    const deleteCurrency = (index) => {
        _arrCurrencies(prevState => {
            prevState.splice(index, 1)
            return [...prevState]
        })
    }

    const CpnFooter = (_, {OkBtn, CancelBtn}) => {
        return (
            <>
                <Button onClick={() => _arrCurrencies(prevState => [...prevState, new Currency()])}>
                    {locale[config.locale].button.new_currency}
                </Button>
                <CancelBtn/>
                <OkBtn/>
            </>
        )
    }

    return (
        <Modal className={"Form Form_ManageCurrency"}
               centered
               closeIcon={false}
               footer={CpnFooter}
               okText={locale[config.locale].button.save}
               cancelText={locale[config.locale].button.cancel}
               onCancel={revertForm}
               onOk={submitForm}
               open={open}
               zIndex={1001}
        >
            <Card bodyStyle={{padding: "0", height: "200px"}}>
                <ScrollArea>
                    {
                        arrCurrencies.map((currency, i) =>
                            <Space.Compact className={"Item_Currency"}>
                                <Input
                                    onChange={event => updateForm(i, "name", event.target.value)}
                                    value={currency.name}
                                    placeholder={locale[config.locale].label.name}
                                    style={{width: "300%"}}
                                    bordered={false}
                                />
                                <Tooltip title={locale[config.locale].tooltip.currency_code}>
                                    <Input
                                        onChange={event => updateForm(i, "code", event.target.value)}
                                        placeholder={locale[config.locale].label.code}
                                        value={currency.code}
                                        bordered={false}
                                    />
                                </Tooltip>
                                <Tooltip title={locale[config.locale].tooltip.currency_code}>
                                    <Input
                                        disabled={currency.isPrimary}
                                        onChange={event => updateForm(i, "rate", event.target.value)}
                                        placeholder={locale[config.locale].label.rate}
                                        value={currency.rate}
                                        bordered={false}
                                    />
                                </Tooltip>
                                <Tooltip title={locale[config.locale].tooltip.primary_currency}>
                                    <Button
                                        onClick={() => updateForm(i, "isPrimary")}
                                        icon={<Icons.UI.Auction/>}
                                        type={currency.isPrimary ? "primary" : "text"}
                                    />
                                </Tooltip>
                                <Button
                                    disabled={currency.isPrimary}
                                    icon={<Icons.UI.Delete/>}
                                    type="text"
                                    onClick={() => deleteCurrency(i)}
                                />
                            </Space.Compact>
                        )
                    }
                </ScrollArea>
            </Card>
        </Modal>
    )
}

export default ManageCurrency
