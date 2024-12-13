import { useContext, useEffect, useState } from 'react'
import './App.css'
import { BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import OrderBook from './OrderBook'
import { SocketContext } from './socket'
import { LineData, Order, OrderMap, symbols } from './lib/util'
import AvgGraph from './AvgGraph'


Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)


function App() {
    const [selectedSymbol, setSelectedSymbol] = useState<number>(0)
    const socket = useContext(SocketContext)
    const [bidsMap, setBidsMap] = useState<OrderMap>(new OrderMap("bid"))
    const [asksMap, setAsksMap] = useState<OrderMap>(new OrderMap("ask"))
    const [lineData, setLineData] = useState<LineData>({
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

        socket.on("orderBook", (orderBook: Order[]) => {
            const newBidsMap = new OrderMap("bid");
            const newAsksMap = new OrderMap("ask");
            console.log(orderBook)
            orderBook.forEach((order) => {
                if (order.side === "ask")
                    newAsksMap.set(order.price, +order.quantity)
                else newBidsMap.set(order.price, +order.quantity)
            });
            setBidsMap(newBidsMap);
            setAsksMap(newAsksMap);
        })

        socket.on("updates", (orders: { asks: Order[], bids: Order[] }) => {
            const newAsksMap = new OrderMap("ask", asksMap.map)
            orders.asks.forEach((o) => newAsksMap.set(o.price, +o.quantity))
            const newBidsMap = new OrderMap("bid", bidsMap.map)
            orders.bids.forEach((o) => newBidsMap.set(o.price, +o.quantity))
            setBidsMap(newBidsMap)
            setAsksMap(newAsksMap)
        })


        socket.on("update", (order: Order) => {
            if (order.side === "ask") {
                const newMap = new OrderMap("ask", asksMap.map)
                newMap.set(order.price, +order.quantity)
                setAsksMap(newMap)
            } else {
                const newMap = new OrderMap("bid", bidsMap.map)
                newMap.set(order.price, +order.quantity)
                setBidsMap(newMap)
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
        socket.emit("joinRoom", selectedSymbol)
        return () => {
            socket.emit("leaveRoom", selectedSymbol)
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
                <OrderBook asksMap={asksMap} bidsMap={bidsMap} />
            </div>
            <div className='average-price-per-timestamp-container'>
                <AvgGraph data={lineData}></AvgGraph>
            </div>
        </div>
    )
}

export default App
