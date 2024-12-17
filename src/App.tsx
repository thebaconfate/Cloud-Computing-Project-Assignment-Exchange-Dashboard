import { useContext, useEffect, useState } from 'react'
import './App.css'
import { BarElement, CategoryScale, Chart, Filler, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js'
import OrderBook from './OrderBook'
import { SocketContext } from './socket'
import { LineData, Order, symbols } from './lib/util'


Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, Filler)


function App() {
    const [selectedSymbol, setSelectedSymbol] = useState<number>(0)
    const socket = useContext(SocketContext)
    const [bids, setBids] = useState<Map<number, number>>(new Map<number, number>())
    const [asks, setAsks] = useState<Map<number, number>>(new Map<number, number>())
    const [_, setLineData] = useState<LineData>({
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
            console.log("orderBook")
            console.log(orderBook)
            const newAsks = new Map<number, number>()
            const newBids = new Map<number, number>()
            orderBook.asks.forEach((a) => newAsks.set(a.price, a.quantity))
            orderBook.bids.forEach((b) => newBids.set(b.price, b.quantity))
            setBids(newBids);
            setAsks(newAsks);
        })

        socket.on("updates", (orders: { asks: Order[], bids: Order[] }) => {
            console.log("updates")
            console.log(orders)
            let minAsk = Infinity;
            setBids(prevMap => {
                const newMap = new Map<number, number>(prevMap)
                orders.bids.forEach((b) => {
                    if (b.quantity === 0)
                        newMap.delete(b.price)
                    else newMap.set(b.price, b.quantity)
                })
                for (const price of newMap.keys())
                    if (price < minAsk)
                        minAsk = price
                return newMap
            })
            let maxBid = - Infinity
            setAsks(prevMap => {
                const newMap = new Map<number, number>(prevMap)
                orders.asks.forEach((a) => {
                    if (a.quantity === 0)
                        newMap.delete(a.price)
                    else newMap.set(a.price, a.quantity)
                })
                for (const price of newMap.keys())
                    if (price > maxBid)
                        maxBid = price
                return newMap
            })
            if (minAsk < maxBid)
                socket.emit("joinRoom", symbols[selectedSymbol])
        })


        socket.on("newOrder", (order: Order) => {
            console.log("newOrder")
            console.log(order)
            if (order.side === "ask") {
                setAsks(prevMap => {
                    const newMap = new Map(prevMap)
                    const oldValue = newMap.get(order.price)
                    if (oldValue)
                        newMap.set(order.price, oldValue + order.quantity)
                    else newMap.set(order.price, order.quantity)
                    return newMap
                })
            } else {
                setBids(prevMap => {
                    const newMap = new Map(prevMap)
                    const oldValue = newMap.get(order.price)
                    if (oldValue)
                        newMap.set(order.price, oldValue + order.quantity)
                    else newMap.set(order.price, order.quantity)
                    return newMap
                })
            }
        })

        socket.on("avgPricePerMin", (lineData: LineData) => {
            setLineData(lineData)
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
                <OrderBook asksMap={asks} bidsMap={bids} />
            </div>
            <div className='average-price-per-timestamp-container'>
                {/*     <AvgGraph data={lineData}></AvgGraph> */}
            </div>
        </div>
    )
}

export default App
