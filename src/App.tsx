import { useContext, useEffect, useState } from 'react'
import './App.css'
import { BarElement, CategoryScale, Chart, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js'
import OrderBook from './OrderBook'
import { SocketContext } from './socket'
import { AveragePricePerStimeStampInit, AveragePricePerTimeStamp, LineData, Order, symbols } from './lib/util'
import AvgGraph from './AvgGraph'


Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Filler)


function orderMapToPriceMap(orderMap: Map<number, Order>) {
    const priceMap = new Map<number, number>()
    for (const order of orderMap.values()) {
        const quantity = priceMap.get(order.price)
        if (quantity)
            priceMap.set(order.price, quantity + order.quantity)
        else priceMap.set(order.price, order.quantity)
    }
    return priceMap
}

function App() {
    const [selectedSymbol, setSelectedSymbol] = useState<number>(0)
    const socket = useContext(SocketContext)
    const [bids, setBids] = useState<Map<number, Order>>(new Map<number, Order>())
    const [asks, setAsks] = useState<Map<number, Order>>(new Map<number, Order>())
    const [check, setCheck] = useState(true)
    const [averagePrices, setAveragePrices] = useState<LineData>({
        askPrices: [],
        bidPrices: [],
        timestamps: []
    })

    function handleSymbolChange(e: React.ChangeEvent<HTMLSelectElement>) {
        try {
            const newValue = parseInt(e.target.value)
            if (newValue < symbols.length && newValue >= 0)
                setSelectedSymbol(newValue)
        } catch (e: any) {
            console.error(e)
        }
    }

    useEffect(() => {

        socket.emit("joinRoom", symbols[selectedSymbol])

        socket.on("orderBook", (orderBook: { asks: Order[], bids: Order[] }) => {
            const newAsks = new Map<number, Order>()
            const newBids = new Map<number, Order>()
            orderBook.asks.forEach((a) => newAsks.set(a.secnum, a))
            orderBook.bids.forEach((b) => newBids.set(b.secnum, b))
            setBids(newBids);
            setAsks(newAsks);
            setCheck(false)
        })

        socket.on("updates", (orders: { asks: Order[], bids: Order[] }) => {
            setBids(prevMap => {
                const newMap = new Map<number, Order>(prevMap)
                orders.bids.forEach((b) => {
                    const order = newMap.get(b.secnum)
                    if (order) {
                        const newQuantity = order.quantity - b.quantity
                        if (newQuantity <= 0)
                            newMap.delete(order.secnum)
                        else newMap.set(b.secnum, { ...order, quantity: newQuantity })
                    }
                })
                return newMap
            })
            setAsks(prevMap => {
                const newMap = new Map<number, Order>(prevMap)
                orders.asks.forEach((a) => {
                    const order = newMap.get(a.secnum);
                    if (order) {
                        const newQuantity = order.quantity - a.quantity
                        if (newQuantity <= 0)
                            newMap.delete(order.secnum)
                        else newMap.set(a.secnum, { ...order, quantity: newQuantity })
                    }
                })
                return newMap
            })
            setCheck(true)
        })


        socket.on("newOrder", (order: Order) => {
            if (order.side === "ask") {
                setAsks(prevMap => {
                    const newMap = new Map(prevMap)
                    newMap.set(order.secnum, order)
                    return newMap
                })
            } else {
                setBids(prevMap => {
                    const newMap = new Map(prevMap)
                    newMap.set(order.secnum, order)
                    return newMap
                })
            }
            setCheck(false)
        })

        socket.on("avgPricesPerMin", (lineData: AveragePricePerStimeStampInit) => {
            const newLineData: LineData = {
                askPrices: lineData.asks.map((e) => e.price),
                bidPrices: lineData.bids.map((e) => e.price),
                timestamps: lineData.bids.map((e) => new Date(e.interval))
            }
            setAveragePrices(newLineData)
        })

        socket.on("avgPricePerMin", (lineData: { asks: AveragePricePerTimeStamp, bids: AveragePricePerTimeStamp }) => {
            setAveragePrices((prev) => {
                return {
                    askPrices: [...prev.askPrices, lineData.asks.price],
                    bidPrices: [...prev.bidPrices, lineData.bids.price],
                    timestamps: [...prev.timestamps, new Date(lineData.bids.interval)]
                }
            })
        })


        socket.on("delete", (order: Order) => {
            const handleUpdate = (prev: Map<number, Order>) => {
                const newAsks = new Map(prev)
                newAsks.delete(order.secnum)
                return newAsks
            }
            if (order.side === 'ask') setAsks(handleUpdate)
            else setBids(handleUpdate)
            setCheck(true)
        })

        socket.on("update", (order: Order) => {
            const handleUpdate = (prev: Map<number, Order>) => {
                const prevOrder = prev.get(order.secnum)
                if (!prevOrder) return prev
                if (prevOrder.quantity <= order.quantity) return prev
                const newMap = new Map(prev)
                newMap.set(order.secnum, order)
                return newMap
            }
            if (order.side === "ask") setAsks(handleUpdate)
            else setBids(handleUpdate)
            setCheck(true)
        })

        return () => {
            socket.off()
        }
    }, [socket])


    useEffect(() => {
        socket.emit("joinRoom", symbols[selectedSymbol])
        return () => {
            socket.emit("leaveRoom", symbols[selectedSymbol])
        }
    }, [selectedSymbol])

    useEffect(() => {
        if (!check) return
        type Checker = {
            secnum: null | number;
            price: number
        }
        let maxBid: Checker | Order = { secnum: null, price: -Infinity }
        let minAsk: Checker | Order = { secnum: null, price: Infinity }
        for (const order of bids.values()) {
            if (order.price > maxBid.price)
                maxBid = order
        }
        for (const order of asks.values()) {
            if (order.price < minAsk.price)
                minAsk = order
        }
        if (maxBid.price > minAsk.price) {
            socket.emit("getCorrection", { ask: minAsk, bid: maxBid })
            setCheck(false)
        }
    }, [check])

    return (
        <div>
            <div className='title-container'>
                <h1>Exchange Dashboard</h1>
            </div>
            <div>
                <select value={selectedSymbol} onChange={handleSymbolChange}>
                    {
                        symbols.map((symb, index) =>
                            <option key={index} value={index}>{symb}</option>
                        )
                    }
                </select>
            </div>
            <div className='order-book-container'>
                <OrderBook asksMap={orderMapToPriceMap(asks)} bidsMap={orderMapToPriceMap(bids)} />
            </div>
            <div className='average-price-per-timestamp-container'>
                <AvgGraph data={averagePrices}></AvgGraph>
            </div>
        </div>
    )
}

export default App
