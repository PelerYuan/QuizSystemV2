const KPICards = ({ data }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Students</p>
                <p className="text-3xl font-black text-slate-800">{data.totalStudents}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-brand-500">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Average Score</p>
                <p className="text-3xl font-black text-slate-800">{data.averageScore}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Highest Score</p>
                <p className="text-3xl font-black text-slate-800">{data.highestScore}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-rose-400">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Lowest Score</p>
                <p className="text-3xl font-black text-slate-800">{data.lowestScore}</p>
            </div>
        </div>
    )
}

export default KPICards