import {useState, useEffect, useMemo} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    ReferenceLine,
    PieChart,
    Pie,
    Legend
} from 'recharts'
import analyticsService from '../services/analytics'

const AdminResult = ({notify}) => {
    const {entranceId} = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('') // 【新增】：搜索框状态

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

    const sortedScores = useMemo(() => {
        if (!data?.scoreList) return []
        return [...data.scoreList].sort((a, b) => b.totalScore - a.totalScore)
    }, [data])

    const pieData = useMemo(() => {
        if (!data?.scoreList || data.maxScore === 0) return []

        const distribution = [
            {name: 'Excellent (80%+)', value: 0, color: '#10b981'},   // 绿
            {name: 'Good (70-79%)', value: 0, color: '#3b82f6'},      // 蓝
            {name: 'Average (50-69%)', value: 0, color: '#f59e0b'},   // 黄
            {name: 'Needs Attention (<50%)', value: 0, color: '#ef4444'} // 红
        ]

        sortedScores.forEach(student => {
            const percentage = (student.totalScore / data.maxScore) * 100
            if (percentage >= 80) distribution[0].value++
            else if (percentage >= 70) distribution[1].value++
            else if (percentage >= 50) distribution[2].value++
            else distribution[3].value++
        })

        return distribution.filter(d => d.value > 0) // 过滤掉人数为0的段位，让饼图更美观
    }, [sortedScores, data?.maxScore])

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

    const isMatch = (name) => searchTerm && name.toLowerCase().includes(searchTerm.toLowerCase())

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
        <div className="max-w-7xl mx-auto p-6 font-sans pb-20 mt-4">

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

                    {/* 【新增】：带搜索栏的图表控制区 */}
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold text-slate-800">Performance Dashboard</h2>
                        <div className="relative w-full md:w-72">
                            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                            <input
                                type="text"
                                placeholder="Search student to highlight..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Score Ranking</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sortedScores} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>

                                        <XAxis
                                            dataKey="studentName"
                                            tick={false}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            domain={[0, data.maxScore]}
                                            tick={{fill: '#64748b', fontSize: 12}}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <RechartsTooltip
                                            cursor={{fill: '#f8fafc'}}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                        />
                                        <ReferenceLine y={data.averageScore} stroke="#f59e0b" strokeDasharray="3 3"
                                                       label={{
                                                           position: 'top',
                                                           value: 'Avg',
                                                           fill: '#f59e0b',
                                                           fontSize: 12
                                                       }}/>

                                        <Bar dataKey="totalScore" name="Score" radius={[4, 4, 0, 0]} barSize={40}>
                                            {sortedScores.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={isMatch(entry.studentName) ? '#f43f5e' : '#0ea5e9'}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Score Distribution</h3>
                            <p className="text-xs text-slate-500 mb-4">Percentage based on max score</p>
                            <div className="flex-1 min-h-[16rem]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`pie-cell-${index}`} fill={entry.color}/>
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}/>

                                        <Legend
                                            verticalAlign="bottom"
                                            content={(props) => {
                                                const {payload} = props;

                                                const orderMap = {
                                                    'Excellent (80%+)': 1,
                                                    'Good (70-79%)': 2,
                                                    'Average (50-69%)': 3,
                                                    'Needs Attention (<50%)': 4
                                                };

                                                const sortedPayload = [...payload].sort((a, b) => orderMap[a.value] - orderMap[b.value]);

                                                return (
                                                    <div className="flex flex-col gap-2.5 pt-4 pl-4">
                                                        {sortedPayload.map((entry, index) => (
                                                            <div key={`item-${index}`}
                                                                 className="flex items-center gap-3">
                                        <span
                                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                                            style={{backgroundColor: entry.color}}
                                        ></span>
                                                                <span className="text-sm font-semibold tracking-wide"
                                                                      style={{color: entry.color}}>
                                            {entry.value}
                                        </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
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
                                        <tr key={student.submissionId}
                                            className={`transition-colors ${highlightClass}`}>
                                            <td className="px-6 py-4 font-bold text-slate-400">
                                                #{idx + 1}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-800">
                                                {student.studentName}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold
                                                        ${student.totalScore >= data.maxScore * 0.8 ? 'bg-green-100 text-green-700' :
                                                        student.totalScore >= data.maxScore * 0.5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
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
                                    )
                                })}
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