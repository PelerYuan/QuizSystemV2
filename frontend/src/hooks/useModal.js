import { useState, useCallback } from 'react'

export const useModal = (initialData = {}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [data, setData] = useState(initialData)

    const open = useCallback((modalData = {}) => {
        setData({ ...initialData, ...modalData })
        setIsOpen(true)
    }, [initialData])

    const close = useCallback(() => {
        setIsOpen(false)
        setTimeout(() => {
            setData(initialData)
        }, 300)
    }, [initialData])

    return {
        isOpen,
        data,
        open,
        close
    }
}