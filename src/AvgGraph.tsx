import { memo } from "react";
import { Line } from "react-chartjs-2";
import { LineData } from "./lib/util";
import { TooltipItem } from "chart.js";
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
            callbacks: {
                labelColor: any
            }
        }
    },
    scales: {
        x: {
            title: { display: boolean, text: string },
            beginAtZero: boolean
        },
        y: {
            title: { display: boolean, text: string },
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
            callbacks: {
                labelColor: function(context: TooltipItem<'line'>) {
                    const dataset = context.dataset;
                    return {
                        borderColor: dataset.borderColor as string,
                        backgroundColor: dataset.borderColor as string,
                        borderWidth: dataset.borderWidth
                    }
                }
            }
        },
    },
    scales: {
        x: {
            title: { display: true, text: "Time" },
            beginAtZero: false,
        },
        y: {
            title: { display: true, text: "Average price" },
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
                borderWidth: 2,
                tension: 0
            },
            {
                label: "bids",
                data: data.bidPrices,
                borderColor: green,
                backgroundColor: green.replace("1)", "0.2"),
                borderWidth: 2,
                tension: 0
            }

        ]
    }
}
const AvgGraph = memo(function AvgGraph({ data }: Props) {
    return <Line data={makeLineChartData(data)} options={options}></Line>
})


export default AvgGraph
