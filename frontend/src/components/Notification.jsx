const Notification = ({ notification }) => {
    if (!notification || notification.message === null) {
        return null
    }

    const { message, type } = notification

    const notificationStyle = {
        color: type === 'error' ? '#dc3545' : '#28a745',
        backgroundColor: type === 'error' ? '#f8d7da' : '#d4edda',
        fontSize: '16px',
        border: `2px solid ${type === 'error' ? '#dc3545' : '#28a745'}`,
        borderRadius: '5px',
        padding: '15px 20px',
        fontWeight: 'bold',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',

        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999
    }

    return (
        <div style={notificationStyle}>
            {message}
        </div>
    )
}

export default Notification