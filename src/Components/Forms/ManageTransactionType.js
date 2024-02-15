import Components from "../Components/Components"
import Forms from "./Forms"
import Icons from "../Icons/Icons"
import ScrollArea from "../Containers/ScrollArea"
import TransactionType from "../../Models/TransactionType"
import locale from "../../Static/Config/Locale/content.json"
import req from "../../Connector/WebConnector"
import {App, Button, Card, List, Modal, Space} from "antd"
import {AppConfig} from "../../App"
import {useContext, useState} from "react"

function ManageTransactionType({open, onClose}) {

    const {modal, message} = App.useApp()

    const {arrRecords, arrTypes, _arrTypes, config} = useContext(AppConfig)

    const [isTypeFormOpen, _isTypeFormOpen] = useState(false)
    const [objCurrentType, _objCurrentType] = useState(new TransactionType())

    const openType = (objType) => {
        _objCurrentType(objType ?? new TransactionType())
        _isTypeFormOpen(true)
    }

    const deleteType = (strKey) => {
        console.log(strKey)
        if (arrRecords.some(obj => obj.type.key === strKey)) {
            message.error(locale[config.locale].msg.delete_type_in_use)
        } else {
            modal.confirm({
                title: locale[config.locale].msg.delete_type,
                cancelText: locale[config.locale].button.cancel,
                okText: locale[config.locale].button.ok,
                centered: true,
                zIndex: 1111,
                maskClosable: true,
                onOk: () => {
                    req.deleteTransactionType(strKey).then(
                        () => req.getTransactionType().then(_arrTypes)
                    )
                }
            })
        }
    }

    const CpnFooter = () => (
        <Button type="primary" onClick={openType}>{locale[config.locale].button.new_type}</Button>
    )

    return (
        <Modal className="Form Form_ManageTransactionType"
               open={open}
               closeIcon={false}
               onCancel={onClose}
               centered
               footer={CpnFooter}
               zIndex={1001}
        >
            <Card bodyStyle={{padding: 0, height: "200px"}}>
                <ScrollArea>
                    <List
                        dataSource={arrTypes.sort((a, b) => a.name.localeCompare(b.name))}
                        renderItem={item => (
                            <List.Item>
                                <Space style={{padding: "0 10px 0 15px", width: "100%", justifyContent: "space-between",}}>
                                    <Components.TransactionType.Tag item={item}/>
                                    <Space>
                                        <Button
                                            icon={<Icons.UI.Edit/>}
                                            type={"text"}
                                            size={"small"}
                                            onClick={() => openType(item)}/>
                                        <Button
                                            type={"text"}
                                            size={"small"}
                                            icon={<Icons.UI.Delete/>}
                                            onClick={() => deleteType(item.key)}
                                        />
                                    </Space>
                                </Space>
                            </List.Item>
                        )}
                    />
                </ScrollArea>
            </Card>
            <Forms.UpsertTransactionType
                open={isTypeFormOpen}
                onClose={() => _isTypeFormOpen(false)}
                data={objCurrentType}
                onSubmit={() => req.getTransactionType().then(_arrTypes)}
            />
        </Modal>
    )
}

export default ManageTransactionType