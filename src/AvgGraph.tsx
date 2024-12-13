import { memo } from "react";
import { Line } from "react-chartjs-2";
import { LineData } from "./lib/util";
interface Props {
    data: LineData,
}



const green = "rgba(112, 199, 128, 1)"
const blue = "rgba(57, 72, 91, 1)"


type LineOptions = {
    responsive: boolean,
    plugins: {
        legend: {
            position: "top" | "right"
        },
        tooltip: {
            mode: "index",
            intersect: boolean
        }
    },
    scales: {
        x: {
            beginAtZero: boolean
        },
        y: {
            beginAtZero: boolean
        }
    }
}
const options: LineOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: "right",
        },
        tooltip: {
            mode: "index",
            intersect: false,
        },
    },
    scales: {
        x: {
            beginAtZero: true,
        },
        y: {
            beginAtZero: true,
        },
    },
};

function makeLineChartData(data: LineData) {
    return {
        labels: data.timestamps.map((l) => `${l.getHours()}:${l.getMinutes()}`),
        datasets: [
            {
                label: "asks",
                data: data.askPrices,
                borderColor: blue,
                backgroundColor: blue.replace("1)", "0.2)"),
                fill: true,
                tension: 0
            },
            {
                label: "bids",
                data: data.bidPrices,
                borderColor: green,
                backgroundColor: green.replace("1)", "0.2"),
                fill: true,
                tension: 0
            }

        ]
    }
}
const AvgGraph = memo(function AvgGraph({ data }: Props) {
    return <Line data={makeLineChartData(data)} options={options}></Line>
})


export default AvgGraph
