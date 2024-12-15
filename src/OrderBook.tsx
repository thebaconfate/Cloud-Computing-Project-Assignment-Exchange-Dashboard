import { memo } from "react";
import { Bar } from "react-chartjs-2";
import { Order } from "./lib/util";


interface Props {
    asksMap: Map<number, number>,
    bidsMap: Map<number, number>
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

function mapsToArray(asksMap: Map<number, number>, bidsMap: Map<number, number>): Order[] {
    const askData: Order[] = Array.from(asksMap.entries(), ([key, value]) => { return { price: key, quantity: value, side: "ask" } }).sort((e1, e2) => e1.price - e2.price)


    const bidData: Order[] = Array.from(bidsMap.entries(), ([key, value]) => { return { price: key, quantity: value, side: "bid" } }).sort((e1, e2) => e2.price - e1.price)

    return bidData.concat(askData)

}


const OrderBook = memo(function OrderBook({ asksMap, bidsMap }: Props) {
    return <Bar data={makeBarChartData(mapsToArray(asksMap, bidsMap))} options={options} />
})

export default OrderBook


