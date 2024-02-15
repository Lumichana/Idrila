import "./Transactions.css"
import Chart from "../Chart/Chart"
import Components from "../Components/Components"
import Forms from "../Forms/Forms"
import Icons from "../Icons/Icons"
import ScrollArea from "../Containers/ScrollArea"
import TransactionRecord from "../../Models/TransactionRecord"
import dayjs from "dayjs"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import locale from "../../Static/Config/Locale/content.json"
import req from "../../Connector/WebConnector"
import {App, Button, Layout, Menu, Space, Table, Tag, Tooltip, Typography} from "antd"
import {AppConfig} from "../../App"
import {useContext, useEffect, useState} from "react"

dayjs.extend(isSameOrBefore)

function Transactions({isSiderOpen,}) {

    const {arrRecords, arrCurrencies, arrTypes, _arrRecords, config} = useContext(AppConfig)

    const {modal} = App.useApp()

    const [objDateIndexes, _objDateIndexes] = useState({})
    const [strCurrentDateIndex, _strCurrentDateIndex] = useState("")

    const [isRecordFormOpen, _isRecordFormOpen] = useState(false)
    const [objCurrentRecord, _objCurrentRecord] = useState(new TransactionRecord())

    const [objAnalysisData, _objAnalysisData] = useState({})
    const [arrEntities, _arrEntities] = useState([])

    const [isAnalysisView, _isAnalysisView] = useState(false)

    const formatDateIndex = (obj) => {
        let objDate = dayjs(obj, "YYYY-MM")
        if (obj === "0") {
            return <span>{locale[config.locale].label.overview}</span>
        } else if (obj.endsWith("-00")) {
            return <span>{`${objDate.format("YYYY")} ${locale[config.locale].label.overview}`}</span>
        } else {
            return <span>{`${locale[config.locale].month[parseInt(objDate.format("MM")) - 1]} ${objDate.format("YYYY")}`}</span>
        }
    }

    const matchDateIndex = (objDate) => {
        if (strCurrentDateIndex === "0") return true
        const arrDate = strCurrentDateIndex.split("-")
        return (objDate.format("YYYY") === arrDate[0]) && (arrDate[1] === "00" || objDate.format("MM") === arrDate[1])
    }

    const getListEntity = () => {
        const arrEntities = new Set()
        for (let i = 0; i < arrRecords.length; i++) {
            arrEntities.add(arrRecords[i].entity)
        }
        _arrEntities(Array.from(arrEntities).map(value => ({text: value, value: value})))
        return Array.from(arrEntities).map(value => ({value: value}))
    }

    const getDateIndexes = (arrRecords) => {
        let objStartDate = dayjs()
        const objEndDate = dayjs()
        for (const obj of arrRecords) {
            if (obj.date && obj.date.isBefore(objStartDate))
                objStartDate = obj.date
        }
        const objIndexes = {
            0: {
                label: <CpnDateTypography code={"0"}/>,
                key: "0",
                icon: <Icons.UI.Dashboard/>
            }
        }
        const arrIndexes = {}
        let currentDate = objStartDate
        while (currentDate.isSameOrBefore(objEndDate, "month")) {
            const CpnIcon = Icons.UI[`Zodiac${currentDate.format("M")}`]
            const strYear = currentDate.format("YYYY")
            const strMonth = currentDate.format("MM")
            const strCode = `${strYear}-${strMonth}`
            const objMonth = {
                label: <CpnDateTypography code={strCode}/>,
                key: strCode,
                icon: <CpnIcon/>
            }
            arrIndexes[strCode] = 0
            if (objIndexes[strYear]) {
                objIndexes[strYear].children.push(objMonth)
            } else {
                objIndexes[strYear] = {
                    label: strYear,
                    key: strYear,
                    icon: <Icons.UI.Database/>,
                    children: [
                        {
                            label: <CpnDateTypography code={`${strYear}-00`}/>,
                            key: `${strYear}-00`
                        },
                        objMonth
                    ]
                }
            }
            currentDate = currentDate.add(1, "month")
        }
        _objDateIndexes(objIndexes)
    }

    const getAnalysisData = () => {

        let objStartDate = dayjs()
        const objEndDate = dayjs()
        for (const obj of arrRecords) {
            if (obj.date && obj.date.isBefore(objStartDate))
                objStartDate = obj.date
        }
        const arrIndexes = {}
        let currentDate = objStartDate
        while (currentDate.isSameOrBefore(objEndDate, "month")) {
            const strYear = currentDate.format("YYYY")
            const strMonth = currentDate.format("MM")
            const strCode = `${strYear}-${strMonth}`
            if (strCurrentDateIndex === "0" ||
                (strCurrentDateIndex.endsWith("00") && strCurrentDateIndex.startsWith(strYear)) ||
                (strCurrentDateIndex === strCode)
            ) {
                arrIndexes[strCode] = 0
            }
            currentDate = currentDate.add(1, "month")
        }

        const objAreaChartData = {}
        const objPieChartData = {}
        const objBarChartData = {}
        const objBalanceByCurrency = {}
        for (const obj of arrTypes.map(o => o.name)) {
            objAreaChartData[obj] = {...arrIndexes}
            objPieChartData[obj] = {value: 0, breakdown: {}}
        }

        let numExpenseSum = 0
        let numIncomeSum = 0

        for (const obj of arrRecords.filter(rcd => matchDateIndex(rcd.date))) {
            const objType = obj.type.name
            if (objBalanceByCurrency[obj.currency.code]) {
                objBalanceByCurrency[obj.currency.code] += parseFloat(obj.isExpense ? 0 - obj.amount : obj.amount)
            } else {
                objBalanceByCurrency[obj.currency.code] = parseFloat(obj.isExpense ? 0 - obj.amount : obj.amount)
            }
            let amount = parseFloat((parseFloat(obj.amount) / parseFloat(obj.currency.rate)).toFixed(2))
            const strDate = obj.date.format("YYYY-MM")
            if (obj.isExpense) {
                objAreaChartData[objType][strDate] += amount
                objPieChartData[objType].value += amount
                if (objPieChartData[objType].breakdown[obj.entity]) {
                    objPieChartData[objType].breakdown[obj.entity] += amount
                } else {
                    objPieChartData[objType].breakdown[obj.entity] = amount
                }
                if (objBarChartData[obj.entity]) {
                    objBarChartData[obj.entity] += amount
                } else {
                    objBarChartData[obj.entity] = amount
                }
                numExpenseSum += amount
            } else {
                numIncomeSum += amount
            }
        }
        console.log(objBalanceByCurrency)

        return {
            balance: {
                expense: Number(numExpenseSum.toFixed(2)),
                income: Number(numIncomeSum.toFixed(2)),
                balance: Number((numIncomeSum - numExpenseSum).toFixed(2)),
                byCurrency: objBalanceByCurrency
            },
            area: [].concat(...Object.keys(objAreaChartData).map(
                strType => Object.keys(objAreaChartData[strType]).map(
                    strDate => ({
                        date: strDate,
                        type: strType,
                        value: Number(objAreaChartData[strType][strDate].toFixed(2))
                    })
                ))
            ),
            pie: Object.keys(objPieChartData).map(
                strType => ({
                    type: strType,
                    value: Number(objPieChartData[strType].value.toFixed(2)),
                    breakdown: Object.keys(objPieChartData[strType].breakdown).map(
                        strEntity => ({
                            type: strEntity,
                            value: Number(objPieChartData[strType].breakdown[strEntity].toFixed(2))
                        }))
                })).filter(o => o.value !== 0),
            bar: Object.keys(objBarChartData).map(
                strEntity => ({
                    name: strEntity,
                    value: Number(objBarChartData[strEntity].toFixed(2))
                })
            ).sort((a, b) => b.value - a.value)
                .filter((value, index) => index < 10)
        }
    }

    const refreshView = () => {
        global.refreshData(data => {
            getDateIndexes(data)
        })
    }

    const openRecord = (objRecord) => {
        if (arrCurrencies.length === 0) {
            modal.info({title: locale[config.locale].msg.no_currencies, centered: true})
        } else if (arrTypes.length === 0) {
            modal.info({title: locale[config.locale].msg.no_types, centered: true})
        } else {
            _objCurrentRecord(objRecord)
            _isRecordFormOpen(true)
        }
    }

    const submitRecord = (objRecord) => {
        _arrRecords(prevState => {
            const isRecordExist = prevState.findIndex(item => item.key === objRecord.key)
            let newState
            if (isRecordExist === -1) {
                newState = [...prevState, objRecord]
            } else {
                prevState[isRecordExist] = objRecord
                newState = [...prevState]
            }
            getDateIndexes(newState)
            return newState
        })
    }

    const deleteRecord = (strKey) => {
        const objModal = modal.confirm({
            title: locale[config.locale].msg.delete_record,
            centered: true,
            onOk: () => {
                req.deleteTransactionRecord(strKey)
                    .then(() => {
                        _arrRecords(prevState => prevState.filter(value => value.key !== strKey))
                        objModal.destroy()
                    })
            },
            maskClosable: true
        })
    }

    const CpnColumnPrice = (obj, record) => {
        return (
            <Space>
                {`${record.isExpense ? "-" : ""}${obj}`}
                <Tag>{record.currency.code}</Tag>
            </Space>
        )
    }

    const CpnDateTypography = ({code}) => {

        const {config} = useContext(AppConfig)

        let objDate = dayjs(code, "YYYY-MM")
        if (code === "0") {
            return <span>{locale[config.locale].label.overview}</span>
        } else if (code.endsWith("-00")) {
            return <span>{`${objDate.format("YYYY")} ${locale[config.locale].label.overview}`}</span>
        } else {
            return <span>{`${locale[config.locale].month[parseInt(objDate.format("MM")) - 1]} ${objDate.format("YYYY")}`}</span>
        }
    }

    const CpnColumnAction = (obj, record) => {
        return (
            <Space>
                <Tooltip title={record.details}>
                    <Button
                        size="small"
                        type="text"
                        icon={<Icons.UI.More/>}
                    />
                </Tooltip>
                <Button
                    size="small"
                    type="text"
                    icon={<Icons.UI.Delete/>}
                    onClick={() => deleteRecord(obj)}
                />
            </Space>
        )
    }

    const tableColumns = [
        {
            dataIndex: "key",
            key: "empty",
            render: () => <></>,
        },
        {
            title: locale[config.locale].label.entity,
            dataIndex: "entity",
            key: "entity",
            filters: arrEntities,
            onFilter: (value, record) => record.entity === value,
            sorter: {compare: (a, b) => a.entity.localeCompare(b.entity), multiple: 1}
        },
        {
            title: locale[config.locale].label.type,
            dataIndex: "type",
            key: "type",
            render: obj => <Components.TransactionType.Tag item={obj}/>,
            filters: arrTypes.map(obj => ({text: <Components.TransactionType.Tag item={obj}/>, value: obj.key})),
            onFilter: (value, record) => record.type.key === value,
            sorter: {compare: (a, b) => a.type.name.localeCompare(b.type.name), multiple: 1}
        },
        {
            title: locale[config.locale].label.date,
            dataIndex: "date",
            key: "date",
            render: obj => obj.format("YYYY-MM-DD"),
            sorter: {compare: (a, b) => Number(a.date.format("MMDD")) - Number(b.date.format("MMDD")), multiple: 1},
            defaultSortOrder: "descend"
        },
        {
            title: locale[config.locale].label.amount,
            dataIndex: "amount",
            key: "amount",
            render: CpnColumnPrice,
            align: "right",
            sorter: {compare: (a, b) => a.amount - b.amount, multiple: 1}
        },
        {
            dataIndex: "key",
            key: "action",
            render: CpnColumnAction,
            align: "center"
        }
    ]

    useEffect(() => {
        refreshView()
        global.refreshView = refreshView
        _strCurrentDateIndex("0")
    }, [])

    useEffect(() => {
        _objAnalysisData(getAnalysisData())
        getListEntity()
    }, [strCurrentDateIndex, arrRecords, arrTypes, arrCurrencies])

    return (
        <Layout className={"Page_Transaction"}>
            <Layout.Sider className={"Sider"} collapsed={!isSiderOpen} theme="light" width={260}>
                <ScrollArea>
                    <Menu className={"TransactionIndex"}
                          defaultSelectedKeys={["0"]}
                          items={Object.values(objDateIndexes)}
                          mode="inline"
                          onSelect={({key}) => _strCurrentDateIndex(key)}
                          style={{border: 0}}
                    />
                </ScrollArea>
            </Layout.Sider>
            <Layout.Content>
                <Layout.Header className={"Header"}>
                    <Space>
                        <Typography.Text>{formatDateIndex(strCurrentDateIndex)}</Typography.Text>
                    </Space>
                    <Space size={0}>
                        {
                            strCurrentDateIndex === "0" || strCurrentDateIndex.endsWith("00") ? null :
                                <Tooltip title={locale[config.locale].tooltip.open_report}>
                                    <Button
                                        danger={isAnalysisView}
                                        icon={<Icons.UI.BubbleChart/>}
                                        onClick={() => _isAnalysisView(prevState => !prevState)}
                                        size={"large"}
                                        type={"text"}
                                    />
                                </Tooltip>
                        }
                        <Tooltip title={locale[config.locale].tooltip.new_record}>
                            <Button
                                icon={<Icons.UI.ListAdd/>}
                                onClick={() => openRecord(new TransactionRecord())}
                                size={"large"}
                                type={"text"}
                            />
                        </Tooltip>
                    </Space>
                </Layout.Header>
                <Layout.Content className={"Content"}>
                    {
                        strCurrentDateIndex === "0" || strCurrentDateIndex.endsWith("00") ?
                            <Chart data={objAnalysisData}/>
                            :
                            isAnalysisView ?
                                <Chart data={objAnalysisData} isPartial/>
                                :
                                <ScrollArea>
                                    <Table
                                        dataSource={arrRecords.filter(rcd => matchDateIndex(rcd.date))}
                                        columns={tableColumns}
                                        className="TransactionTable"
                                        pagination={false}
                                        size={"small"}
                                        onRow={(record, rowIndex) => {
                                            return {
                                                onDoubleClick: () => openRecord(Object.assign(new TransactionRecord(), record))
                                            }
                                        }}
                                    />
                                </ScrollArea>
                    }
                </Layout.Content>
                <Layout.Footer className={"Footer"}>
                    <Space>
                        <Tag>{arrCurrencies.find(c => c.isPrimary)?.code}</Tag>
                    </Space>
                    <Space>
                        <Space.Compact>
                            <Tag color={"green"}>{locale[config.locale].label.income}</Tag>
                            <Typography.Text>{objAnalysisData.balance?.income}</Typography.Text>
                        </Space.Compact>
                        <Space.Compact>
                            <Tag color={"red"}>{locale[config.locale].label.expense}</Tag>
                            <Typography.Text>{objAnalysisData.balance?.expense}</Typography.Text>
                        </Space.Compact>
                        <Space.Compact>
                            <Tag color={"orange"}>{locale[config.locale].label.balance}</Tag>
                            <Typography.Text>{objAnalysisData.balance?.balance}</Typography.Text>
                        </Space.Compact>
                    </Space>
                </Layout.Footer>
            </Layout.Content>
            <Forms.UpsertTransactionRecord
                arrEntities={arrEntities}
                data={objCurrentRecord}
                onClose={() => _isRecordFormOpen(false)}
                onSubmit={submitRecord}
                open={isRecordFormOpen}
            />
        </Layout>
    )
}

export default Transactions