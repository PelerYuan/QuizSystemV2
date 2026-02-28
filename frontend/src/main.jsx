import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { UserProvider } from './contexts/UserContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import './assets/index.css'

createRoot(document.getElementById('root')).render(
    <UserProvider>
        <NotificationProvider>
            <App />
        </NotificationProvider>
    </UserProvider>
)
