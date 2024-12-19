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
            beginAtZero: false,
        },
        y: {
            beginAtZero: false,
        },
    },
};

function formatTime(date: Date) {
    const mins = date.getMinutes()
    return `${date.getHours()}:${mins > 9 ? mins : "0" + mins.toString()
        } `
}

function makeLineChartData(data: LineData) {
    return {
        labels: data.timestamps.map((l) => {
            return formatTime(l)
        }),
        datasets: [
            {
                label: "asks",
                data: data.askPrices,
                borderColor: blue,
                backgroundColor: blue.replace("1)", "0.2)"),
                tension: 0
            },
            {
                label: "bids",
                data: data.bidPrices,
                borderColor: green,
                backgroundColor: green.replace("1)", "0.2"),
                tension: 0
            }

        ]
    }
}
const AvgGraph = memo(function AvgGraph({ data }: Props) {
    return <Line data={makeLineChartData(data)} options={options}></Line>
})


export default AvgGraph
