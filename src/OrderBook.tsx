import { useContext, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { SocketContext } from "./socket";

enum SIDE {
    ASK = "ask",
    BID = "bid"
}

interface Order {
    price: number,
    quantity: number,
    side: "ask" | "bid"
}

interface Execution extends Order { }

interface Props {
    symbol: string
}


const green = "rgb(95, 173, 63)"
const red = "rgb(212, 67, 47)"
const options = {
    responsive: true,
    plugins: {
        legend: {
            display: true,
            labels: {
                generateLabels: () => [
                    {
                        text: "Bids",
                        fillStyle: green,
                        strokeStyle: green,
                    },
                    {
                        text: "Asks",
                        fillStyle: red,
                        strokeStyle: red,
                    }
                ]
            }
        },
        title: {
            display: true,
            text: "Order book"
        }
    },
    scales: {
        x: {
            title: {
                display: true,
                text: "Price"
            }
        },
        y: {
            title: {
                display: true,
                text: "Quantity"
            }
        }
    }
}


function makeBarChartData(data: Order[]) {
    return {
        labels: data.map((order) => order.price),
        datasets: [
            {
                label: "Quantity",
                data: data.map((order) => order.quantity),
                backgroundColor: data.map((d) => d.side === "bid" ? green : red),
                borderColor: data.map((d) => d.side === "bid" ? green : red).map((d) => d.replace("0.6", "1")),
                borderWidth: 1
            }
        ]

    }
}

function binarySearch(hayStack: Order[], compare: (order: Order) => number, insert: boolean = false) {
    let left = 0
    let right = insert ? hayStack.length : hayStack.length - 1
    while (left < right) {
        const mid = Math.floor((left + right) / 2)
        const cmp = compare(hayStack[mid])
        if (cmp === 0) return mid;
        else if (cmp < 0) right = insert ? mid - 1 : mid
        else left = mid + 1
    }
    return left
}

export default function OrderBook({ symbol }: Props) {
    const socket = useContext(SocketContext)
    const [bids, setBids] = useState<Order[]>([])
    const [asks, setAsks] = useState<Order[]>([])

    useEffect(() => {

        socket.emit("init", symbol)
        socket.emit("joinRoom", symbol)

        socket.on("orderBook", (orderBook: Order[]) => {
            setBids(orderBook.filter((order) => order.side === SIDE.BID))
            setAsks(orderBook.filter((order) => order.side === SIDE.ASK))
        })

        socket.on("execution", (execution: Execution) => {
            function handleEvent(arr: Order[], cmp: (order: Order) => number, set: (value: React.SetStateAction<Order[]>) => void) {
                const index = binarySearch(arr, cmp)
                if (index < arr.length && arr[index].price === execution.price) {
                    arr[index].quantity -= execution.quantity
                    if (arr[index].quantity === 0)
                        arr.splice(index, 1)
                    set(arr)
                }

            }
            switch (execution.side) {
                case SIDE.ASK:
                    handleEvent(asks, (order: Order) => execution.price - order.price, setAsks)
                    break;
                case SIDE.BID:
                    handleEvent(bids, (order: Order) => order.price - execution.price, setBids)
                    break;
                default:
                    break;
            }
        })

        socket.on("order", (order: Order) => {
            function handleEvent(arr: Order[], cmp: (order: Order) => number, set: (value: React.SetStateAction<Order[]>) => void) {
                const index = binarySearch(arr, cmp, true)
                if (index === arr.length)
                    arr.push(order)
                else {
                    if (arr[index].price === order.price)
                        arr[index].quantity += order.quantity
                    else
                        arr.splice(index, 0, order)
                }
                set(arr)
            }

            switch (order.side) {
                case SIDE.ASK:
                    handleEvent(asks, (otherOrder: Order) => order.price - otherOrder.price, setAsks)
                    break;
                case SIDE.BID:
                    handleEvent(bids, (otherOrder: Order) => otherOrder.price - order.price, setBids)
                    break;
                default: break
            }
        })

        return () => {
            socket.emit("leaveRoom", symbol)
            socket.off()
        }

    }, [socket, symbol])

    return <Bar data={makeBarChartData(bids.concat(asks))} options={options} />
}
