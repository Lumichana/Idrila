import Icons from "../Icons/Icons"
import locale from "../../Static/Config/Locale/content.json"
import localeOptions from "../../Static/Config/Locale/options.json"
import req from "../../Connector/WebConnector"
import {AppConfig} from "../../App"
import {Button, ColorPicker, Form, Input, Modal, Select, Space, Tooltip, Upload} from "antd"
import {useContext, useEffect, useState} from "react"
import {colorPrimary} from "../../Static/Config/Color/Color";

function Settings({open, onClose}) {

    const {config, _config} = useContext(AppConfig)

    const [objConfig, _objConfig] = useState(config)

    const [dbConfig, _dbConfig] = useState({})

    const submitForm = () => {
        req.upsertConfig(objConfig).then(() => _config(objConfig))
        req.updateDbConfig(dbConfig).then(global.refreshView)
        onClose()
    }

    const revertForm = () => {
        _objConfig(config)
        req.getDbConfig().then(_dbConfig)
        onClose()
    }

    useEffect(() => {
        _objConfig(config)
        req.getDbConfig().then(_dbConfig)
    }, [config])


    return (
        <Modal className={"Form Form_Settings"}
               centered
               closeIcon={false}
               okText={locale[config.locale].button.save}
               cancelText={locale[config.locale].button.cancel}
               onCancel={revertForm}
               onOk={submitForm}
               open={open}
        >
            <Form colon={false} labelCol={{span: 6}} labelWrap labelAlign={"left"} style={{marginTop: "10px"}} wrapperCol={{span: 18}}>
                <Form.Item label={locale[config.locale].label.datafile} tooltip={locale[config.locale].tooltip.datafile}>
                    <Space.Compact style={{width: "100%"}}>
                        <Input value={`${dbConfig.dbLocation}\\${dbConfig.dbName}.db`}/>
                        <Upload name={locale[config.locale].label.datafile}
                                beforeUpload={file => {
                                    _dbConfig({
                                        dbLocation: file.path.replace(file.name, "").slice(0, -1),
                                        dbName: file.name.replace(".db", "")
                                    })
                                    return false
                                }}
                                accept={".db"}
                                showUploadList={false}
                        >
                            <Button icon={<Icons.UI.More/>}/>
                        </Upload>
                    </Space.Compact>
                </Form.Item>
                <Form.Item label={locale[config.locale].label.lang}>
                    <Select
                        options={localeOptions}
                        value={objConfig.locale}
                        onChange={value => _objConfig(prevState => ({...prevState, locale: value}))}
                    />
                </Form.Item>
                <Form.Item label={locale[config.locale].label.color} tooltip={locale[config.locale].tooltip.primary_color}>
                    <Space style={{width: "100%", justifyContent: "space-between"}}>
                        <ColorPicker
                            showText
                            value={objConfig.colorPrimary}
                            onChange={(color, hex) => _objConfig(prevState => ({...prevState, colorPrimary: hex}))}
                        />
                        <Tooltip title={locale[config.locale].tooltip.reset_color}>
                            <Button icon={<Icons.UI.Refresh/>} onClick={() => _objConfig(prevState => ({...prevState, colorPrimary: colorPrimary}))}/>
                        </Tooltip>
                    </Space>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default Settings
