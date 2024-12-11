import { useState } from 'react'
import './App.css'
import { BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import OrderBook from './OrderBook'

const symbols = ["AAPL", "AMZN", "MSFT", "GOOGL"]

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function App() {
    const [selectedSymbol, setSelectedSymbol] = useState<number>(0)

    function handleSymbolChange(e: React.ChangeEvent<HTMLSelectElement>) {
        try {
            const newValue = parseInt(e.target.value)
            if (newValue < symbols.length && newValue >= 0)
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
                            <option key={index} value={index}>{symb}</option>
                        )
                    }
                </select>
            </div>
            <div className='order-book-container'>
                <OrderBook symbol={symbols[selectedSymbol]} />
            </div>
            <div className='average-price-per-timestamp-container'></div>
        </div>
    )
}

export default App
