import {useState, useEffect} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine} from 'recharts'
import analyticsService from '../services/analytics'

const AdminResult = ({notify}) => {
    const {entranceId} = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const result = await analyticsService.getEntranceAnalytics(entranceId)
                setData(result)
            } catch (error) {
                notify('Failed to load analytics data.', 'error')
                navigate('/admin/dashboard')
            } finally {
                setIsLoading(false)
            }
        }
        fetchAnalytics()
    }, [entranceId, navigate, notify])

    const handleExportCSV = async () => {
        try {
            setIsExporting(true)
            const safeFilename = `${data.entranceName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`
            await analyticsService.downloadExport(entranceId, safeFilename)
            notify('Results exported successfully!', 'success')
        } catch (error) {
            notify('Failed to export CSV.', 'error')
        } finally {
            setIsExporting(false)
        }
    }

    if (isLoading) {
        return (
            <div
                className="min-h-screen flex justify-center items-center text-xl text-brand-600 font-semibold animate-pulse">
                📊 Crunching Numbers...
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="max-w-6xl mx-auto p-6 font-sans pb-20 mt-4">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-sm font-bold text-slate-500 hover:text-brand-600 mb-2 transition-colors flex items-center gap-1"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-extrabold text-brand-900 tracking-tight">
                        {data.entranceName} Analytics
                    </h1>
                    <p className="text-slate-500 mt-1">Maximum Possible Score: {data.maxScore}</p>
                </div>

                <button
                    onClick={handleExportCSV}
                    disabled={isExporting || data.totalStudents === 0}
                    className={`px-6 py-3 rounded-lg font-bold text-white shadow transition-all flex items-center gap-2
                        ${isExporting || data.totalStudents === 0
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 active:scale-95 hover:shadow-md'}`}
                >
                    {isExporting ? '⏳ Exporting...' : '📥 Download CSV'}
                </button>
            </div>

            {/* Empty State Handle */}
            {data.totalStudents === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-16 text-center shadow-sm">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Submissions Yet</h3>
                    <p className="text-slate-500">Wait for students to complete the exam to see analytics and
                        charts.</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total
                                Students</p>
                            <p className="text-3xl font-black text-slate-800">{data.totalStudents}</p>
                        </div>
                        <div
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-brand-500">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Average
                                Score</p>
                            <p className="text-3xl font-black text-slate-800">{data.averageScore}</p>
                        </div>
                        <div
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Highest
                                Score</p>
                            <p className="text-3xl font-black text-slate-800">{data.highestScore}</p>
                        </div>
                        <div
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-rose-400">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Lowest
                                Score</p>
                            <p className="text-3xl font-black text-slate-800">{data.lowestScore}</p>
                        </div>
                    </div>

                    {/* Dynamic Chart Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6">Score Distribution</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.scoreList} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                                    <XAxis
                                        dataKey="studentName"
                                        tick={{fill: '#64748b', fontSize: 12}}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        domain={[0, data.maxScore]}
                                        tick={{fill: '#64748b', fontSize: 12}}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                    />
                                    <ReferenceLine y={data.averageScore} stroke="#f59e0b" strokeDasharray="3 3" label={{
                                        position: 'top',
                                        value: 'Avg',
                                        fill: '#f59e0b',
                                        fontSize: 12
                                    }}/>
                                    <Bar
                                        dataKey="totalScore"
                                        name="Score"
                                        fill="#0ea5e9" // Tailwind sky-500
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Data Table Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">Detailed Results</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4 text-center">Score</th>
                                    <th className="px-6 py-4">Submission Time</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                {data.scoreList.map((student) => (
                                    <tr key={student.submissionId} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {student.studentName}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold
                                                    ${student.totalScore >= data.maxScore * 0.6 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                >
                                                    {student.totalScore} / {data.maxScore}
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
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default AdminResult