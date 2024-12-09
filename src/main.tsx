import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SocketContext, socket } from './socket.ts'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SocketContext.Provider value={socket}>
            <App />
        </SocketContext.Provider>
    </StrictMode>,
)
