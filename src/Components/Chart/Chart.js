import "./Chart.css"
import ScrollArea from "../Containers/ScrollArea"
import {AppConfig} from "../../App"
import {Area, Bar, Liquid, Pie} from "@ant-design/plots"
import {Divider, Empty, Select, Space, Tag, Typography} from "antd"
import {useContext, useEffect, useState} from "react"
import locale from "../../Static/Config/Locale/content.json"
import Components from "../Components/Components";

function Chart({isPartial, data}) {

    const {arrTypes, arrCurrencies, config} = useContext(AppConfig)
    const [strPieChartKey, _strPieChartKey] = useState("")
    const [numPieChartSum, _numPieChartSum] = useState(0)

    useEffect(() => {
        _numPieChartSum(() => {
            try {
                const arrData = data.pie.find(o => o.type === strPieChartKey)?.breakdown ?? data.pie
                let numSum = 0
                for (const data of arrData) {
                    numSum += data.value
                }
                return `$ ${Number(numSum.toFixed(2))}`
            } catch {
                return ""
            }
        })
    }, [data, strPieChartKey])

    const getPercentageBalance = () => {
        try {
            if (data.balance.income === 0) {
                return data.balance.balance
            } else {
                return Number((data.balance.balance / data.balance.income).toFixed(4))
            }
        } catch (error) {
            return 0
        }
    }

    function generateStatusColor() {
        let h = getPercentageBalance() * 100
        if (h < 0) h = 0
        h /= 360
        let s = 1
        let l = 0.69
        let r, g, b
        if (s === 0) {
            r = g = b = l
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1
                if (t > 1) t -= 1
                if (t < 1 / 6) return p + (q - p) * 6 * t
                if (t < 1 / 2) return q
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
                return p
            }
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s
            const p = 2 * l - q
            r = hue2rgb(p, q, h + 1 / 3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1 / 3)
        }
        const toHex = (x) => {
            const hex = Math.round(x * 255).toString(16)
            return hex.length === 1 ? "0" + hex : hex
        }
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    return (
        data.pie.length === 0 ?
            <Empty/>
            :
            <ScrollArea>
                <div className={"Report"}>
                    <div className={"Report-Page Page1"}>
                        <div className={"Report-Balance"}>
                            <div className={"Report-Balance-Number"}>
                                <Typography.Title level={3}>{locale[config.locale].label.cash_balance}</Typography.Title>
                                <Typography.Title>$ {data.balance.balance}</Typography.Title>
                                <Typography.Paragraph>{locale[config.locale].label.currency_balance}</Typography.Paragraph>
                                <ScrollArea>
                                    <div className={"Report-Currency"}>
                                        {
                                            arrCurrencies.map(obj => (
                                                <Space>
                                                    <Tag>{obj.code}</Tag>
                                                    <Typography.Text>{Number((data.balance.byCurrency[obj.code])).toFixed(2)}</Typography.Text>
                                                </Space>
                                            ))
                                        }
                                    </div>
                                </ScrollArea>
                            </div>
                            <Divider/>
                            <div className={"Report-Balance-Graph"}>
                                <Liquid
                                    percent={getPercentageBalance()}
                                    outline={{border: 4, distance: 8}}
                                    wave={{length: 128}}
                                    color={generateStatusColor(getPercentageBalance() * 100)}
                                />
                            </div>
                        </div>
                        <Divider type={"vertical"}/>
                        <div className={"Report-TTB"}>
                            <Typography.Title level={3}>{locale[config.locale].label.graph_ttb}</Typography.Title>
                            <div className={"Report-TTB-EB"}>
                                <Typography.Text>{locale[config.locale].label.entity_breakdown}</Typography.Text>
                                <Select
                                    size={"small"}
                                    options={arrTypes.map(Components.TransactionType.Select)}
                                    allowClear
                                    onChange={value => _strPieChartKey(arrTypes.find(obj => obj.key === value)?.name ?? "")}
                                />
                            </div>
                            <Divider/>
                            <Pie className={"Report-TTB-Chart"}
                                 appendPadding={10}
                                 angleField={"value"}
                                 colorField={"type"}
                                 data={data.pie.find(o => o.type === strPieChartKey)?.breakdown ?? data.pie}
                                 radius={0.8}
                                 statistic={{
                                     title: false,
                                     content: {content: numPieChartSum}
                                 }}
                                 innerRadius={0.6}
                                 label={{type: "spider", labelHeight: 28, content: "{name}\n{percentage}"}}
                                 legend={{layout: "horizontal", position: "top"}}
                            />
                        </div>
                    </div>
                    <Divider/>
                    {
                        isPartial ? null :
                            <div className={"Report-Page Page2"}>
                                <Typography.Title level={3}>{locale[config.locale].label.graph_ttbt}</Typography.Title>
                                <Area
                                    className={"Report-TTBT"}
                                    data={data.area}
                                    xField="date"
                                    yField="value"
                                    seriesField="type"
                                    smooth
                                />
                            </div>
                    }
                    <div className={"Report-Page Page3"}>
                        <Typography.Title level={3}>{locale[config.locale].label.graph_teb}</Typography.Title>
                        <Bar
                            className={"Report-TEB"}
                            xField={"value"}
                            yField={"name"}
                            data={data.bar}
                            seriesField={"name"}
                            legend={{position: "top"}}
                            yAxis={{label: null}}
                        />
                    </div>
                </div>
            </ScrollArea>
    )
}

export default Chart