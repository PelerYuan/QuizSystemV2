import { ArrowLeft, Hourglass, Download } from 'lucide-react'

const AnalyticsHeader = ({ data, isExporting, onExport, onBack }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <button
                    onClick={onBack}
                    className="text-sm font-bold text-slate-500 hover:text-brand-600 mb-2 transition-colors flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4 mr-1 inline-block" /> Back to Dashboard
                </button>
                <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight">
                    {data.entranceName} Analytics
                </h1>
                <p className="text-slate-500 mt-1">Maximum Possible Score: {data.maxScore}</p>
            </div>

            <button
                onClick={onExport}
                disabled={isExporting || data.totalStudents === 0}
                className={`px-6 py-3 rounded-lg font-bold text-white shadow transition-all flex items-center gap-2
                    ${isExporting || data.totalStudents === 0
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 hover:shadow-md'}`}
            >
                {isExporting ? (
                    <><Hourglass className="w-4 h-4 animate-spin" /> Exporting...</>
                ) : (
                    <><Download className="w-4 h-4" /> Download CSV</>
                )}
            </button>
        </div>
    )
}

export default AnalyticsHeader