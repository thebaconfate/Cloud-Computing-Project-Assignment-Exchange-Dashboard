import { useState } from 'react'
import './App.css'
import { Bar } from 'react-chartjs-2'
import { BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip } from 'chart.js'


interface Order {
    price: number,
    quantity: number,
    side: string
}
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function App() {
    const symbols = ["AAPL", "AMZN", "MSFT", "GOOGL"]
    const data: Order[] = [
        {
            price: 100,
            quantity: 50,
            side: "ask"
        },
        {
            price: 20,
            quantity: 20,
            side: "ask"
        }, {
            price: 100,
            quantity: 50,
            side: "ask"
        },
        {
            price: 100,
            quantity: 50,
            side: "bid"
        },
    ]
    const green = "rgb(95, 173, 63)"
    const red = "rgb(212, 67, 47)"
    const barData = {
        labels: data.map((o) => o.price),
        datasets: [
            {
                label: "Quantity",
                data: data.map((d) => d.quantity),
                backgroundColor: data.map((d) => d.side === "ask" ? green : red),
                borderColor: data.map((d) => d.side === "ask" ? green : red).map((d) => d.replace("0.6", "1")),
                borderWidth: 1
            }
        ]
    }

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
    const [selectedSymbol, setSelectedSymbol] = useState<number>(0)

    function handleSymbolChange(e: React.ChangeEvent<HTMLSelectElement>) {
        try {
            const newValue = parseInt(e.target.value)
            if (newValue < symbols.length)
                setSelectedSymbol(newValue)
        } catch (e: any) {
            console.error(e)
        }
    }
    return (
        <div>
            <div className='title-container'>
                <h1>Exchange Dashboard</h1>
            </div>
            <div>
                <select value={selectedSymbol} onChange={handleSymbolChange}>
                    {
                        symbols.map((symb, index) =>
                            <option value={index}>{symb}</option>
                        )
                    }
                </select>
            </div>
            <Bar data={barData} options={options}></Bar>
        </div>
    )
}

export default App
