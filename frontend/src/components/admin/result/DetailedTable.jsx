import { useNavigate } from 'react-router-dom'

const DetailedTable = ({ sortedScores, maxScore, searchTerm }) => {
    const navigate = useNavigate()

    const isMatch = (name) => searchTerm && name.toLowerCase().includes(searchTerm.toLowerCase())

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-800">Detailed Results</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Rank</th>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4 text-center">Score</th>
                        <th className="px-6 py-4">Submission Time</th>
                        <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {sortedScores.map((student, idx) => {
                        const highlightClass = isMatch(student.studentName)
                            ? 'bg-rose-50 border-l-4 border-l-rose-500'
                            : 'hover:bg-slate-50 border-l-4 border-l-transparent'

                        return (
                            <tr key={student.submissionId} className={`transition-colors ${highlightClass}`}>
                                <td className="px-6 py-4 font-bold text-slate-400">
                                    #{idx + 1}
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-800">
                                    {student.studentName}
                                </td>
                                <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold
                                            ${student.totalScore >= maxScore * 0.8 ? 'bg-green-100 text-green-700' :
                                            student.totalScore >= maxScore * 0.5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                                        >
                                            {student.totalScore} / {maxScore}
                                        </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(student.submittedAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => navigate(`/result/${student.submissionId}`)}
                                        className="text-brand-600 font-bold text-sm hover:text-brand-800 underline transition-colors"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default DetailedTable