import { useNavigate } from 'react-router-dom'

const EntranceItem = ({ entrance, onDelete, onToggleActive, onCopyCode, onCopyLink }) => {
    const navigate = useNavigate()
    const currentEntId = entrance.id || entrance._id

    const cardStyle = entrance.isActive
        ? "bg-white border-slate-200 hover:border-brand-300 shadow-sm"
        : "bg-slate-100 border-slate-200 opacity-75 grayscale-[20%]"

    return (
        <div className={`flex flex-col lg:flex-row justify-between items-center p-4 rounded-lg border gap-4 transition-all ${cardStyle}`}>
            {/* Left: Entrance Info */}
            <div className="w-full lg:w-auto lg:flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full shrink-0 shadow-inner ${entrance.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    <span className={`font-semibold truncate ${entrance.isActive ? 'text-slate-700' : 'text-slate-500 line-through decoration-slate-300'}`}>
                        {entrance.name}
                    </span>
                </div>
                <div className="pl-5 text-xs text-slate-500 line-clamp-1">
                    {entrance.description || <span className="italic text-slate-400">No description provided.</span>}
                </div>
            </div>

            {/* Middle: Access Code */}
            <div className="w-full lg:w-auto flex-none flex justify-center">
                <button
                    onClick={() => onCopyCode(entrance)}
                    title={entrance.isActive ? "Click to copy Code" : "Inactive - Cannot copy"}
                    className={`border px-6 py-1.5 rounded-md font-mono font-bold text-lg text-center
                        ${entrance.isActive
                        ? 'bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100 hover:border-brand-300 active:scale-95'
                        : 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                    {entrance.accessCode}
                </button>
            </div>

            {/* Right: Actions */}
            <div className="w-full lg:w-auto flex-none flex justify-end gap-2 overflow-x-auto pb-2 lg:pb-0">
                <button
                    onClick={() => onDelete(currentEntId, entrance.accessCode)}
                    className="px-3 py-1.5 border border-rose-200 text-rose-500 hover:bg-rose-50 text-sm font-bold rounded transition-colors whitespace-nowrap"
                >
                    Delete
                </button>

                <button
                    onClick={() => onToggleActive(entrance)}
                    className={`px-3 py-1.5 text-sm font-bold rounded transition-colors whitespace-nowrap ${
                        entrance.isActive
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                    }`}
                >
                    {entrance.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <button
                    onClick={() => navigate(`/admin/result/${currentEntId}`)}
                    className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-sm font-bold rounded transition-colors whitespace-nowrap"
                >
                    Results
                </button>

                <button
                    onClick={() => onCopyLink(entrance)}
                    className={`px-3 py-1.5 text-sm font-bold rounded transition-colors whitespace-nowrap
                        ${entrance.isActive
                        ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'}`}
                >
                    Copy Link
                </button>
            </div>
        </div>
    )
}

export default EntranceItem