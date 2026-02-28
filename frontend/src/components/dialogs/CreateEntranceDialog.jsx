import {Dialog, DialogPanel, DialogTitle, Transition, TransitionChild} from '@headlessui/react'
import {Fragment, useState, useEffect} from 'react'

const CreateEntranceDialog = ({isOpen, onClose, onSubmit}) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        if (isOpen) {
            setName(``)
            setDescription('')
        }
    }, [isOpen])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (name.trim()) {
            onSubmit(name.trim(), description.trim())
            onClose()
        }
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"/>
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel
                                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <form onSubmit={handleSubmit}>
                                    <DialogTitle as="h3" className="text-xl font-bold text-slate-900 mb-4">
                                        Create Exam Session
                                    </DialogTitle>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Session
                                                Name *</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. Fall 2026 Midterm"
                                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Description
                                                (Optional)</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Enter any specific instructions or remarks..."
                                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 h-24 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!name.trim()}
                                            className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
                                        >
                                            Create Entrance
                                        </button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default CreateEntranceDialog