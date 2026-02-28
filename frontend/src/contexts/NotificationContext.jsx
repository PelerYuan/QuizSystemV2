import { createContext, useContext } from 'react'
import toast from 'react-hot-toast'
import { TriangleAlert } from 'lucide-react'

/* eslint-disable react-refresh/only-export-components */

const NotificationContext = createContext()

export const useNotification = () => {
    return useContext(NotificationContext)
}

export const NotificationProvider = ({ children }) => {
    
    const notify = (message, type = 'success') => {
        if (type === 'error') {
            toast.error(message)
        } else if (type === 'warning') {
            toast(message, {
                icon: <TriangleAlert className="w-5 h-5 text-amber-600" />,
                style: {
                    color: '#92400e',
                    backgroundColor: '#fef3c7',
                    border: '2px solid #f59e0b'
                }
            })
        } else {
            toast.success(message)
        }
    }

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
        </NotificationContext.Provider>
    )
}
export default NotificationProvider
