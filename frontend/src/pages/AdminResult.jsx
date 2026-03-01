import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart2, Inbox } from 'lucide-react'
import analyticsService from '../services/analytics'

import SearchAutocomplete from '../components/common/SearchAutocomplete'
import AnalyticsHeader from '../components/admin/result/AnalyticsHeader'
import KPICards from '../components/admin/result/KPICards'
import ChartsPanel from '../components/admin/result/ChartsPanel'
import DetailedTable from '../components/admin/result/DetailedTable'

const AdminResult = ({ notify }) => {
    const { entranceId } = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

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
            { name: 'Excellent (80%+)', value: 0, color: '#10b981' },
            { name: 'Good (70-79%)', value: 0, color: '#3b82f6' },
            { name: 'Average (50-69%)', value: 0, color: '#f59e0b' },
            { name: 'Needs Attention (<50%)', value: 0, color: '#ef4444' }
        ]

        sortedScores.forEach(student => {
            const percentage = (student.totalScore / data.maxScore) * 100
            if (percentage >= 80) distribution[0].value++
            else if (percentage >= 70) distribution[1].value++
            else if (percentage >= 50) distribution[2].value++
            else distribution[3].value++
        })

        return distribution.filter(d => d.value > 0)
    }, [sortedScores, data?.maxScore])

    const handleExportCSV = async () => {
        try {
            setIsExporting(true)
            const safeFilename = `${data.entranceName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`
            await analyticsService.downloadExport(entranceId, safeFilename)
            notify('Results exported successfully!', 'success')
        } catch (error) {
            notify(error.response?.data?.error || 'Failed to export CSV.', 'error')
        } finally {
            setIsExporting(false)
        }
    }

    const filterLocalScores = useCallback(async (query, signal) => {
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                const filtered = sortedScores.filter(s =>
                    s.studentName.toLowerCase().includes(query.toLowerCase())
                )
                resolve(filtered)
            }, 300)

            if (signal) {
                signal.addEventListener('abort', () => clearTimeout(timeoutId))
            }
        })
    }, [sortedScores])

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center text-xl text-brand-600 font-semibold animate-pulse">
                <BarChart2 className="w-6 h-6 inline-block mr-2" /> Crunching Numbers...
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="max-w-7xl mx-auto p-6 font-sans pb-20 mt-4">
            <AnalyticsHeader
                data={data}
                isExporting={isExporting}
                onExport={handleExportCSV}
                onBack={() => navigate('/admin/dashboard')}
            />

            {data.totalStudents === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-16 text-center shadow-sm">
                    <div className="text-5xl mb-4 flex justify-center"><Inbox className="w-16 h-16 text-slate-300" /></div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No Submissions Yet</h3>
                    <p className="text-slate-500">Wait for students to complete the exam to see analytics and charts.</p>
                </div>
            ) : (
                <>
                    <KPICards data={data} />

                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-4 gap-4">
                        <h2 className="text-2xl font-bold text-slate-800">Performance Dashboard</h2>
                        <div className="w-full md:w-80">
                            <SearchAutocomplete
                                placeholder="Find student to highlight..."
                                fetchSuggestions={filterLocalScores}
                                onInputChange={(val) => setSearchTerm(val)}
                                onSelect={(student) => setSearchTerm(student.studentName)}
                                getDisplayValue={(student) => student.studentName}
                                renderItem={(student, isHighlighted) => (
                                    <div className="flex justify-between items-center">
                                        <span className={`font-medium ${isHighlighted ? 'text-brand-700' : 'text-slate-700'}`}>
                                            {student.studentName}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isHighlighted ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                                            {student.totalScore} pts
                                        </span>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    <ChartsPanel
                        sortedScores={sortedScores}
                        pieData={pieData}
                        maxScore={data.maxScore}
                        averageScore={data.averageScore}
                        searchTerm={searchTerm}
                    />

                    <DetailedTable
                        sortedScores={sortedScores}
                        maxScore={data.maxScore}
                        searchTerm={searchTerm}
                    />
                </>
            )}
        </div>
    )
}

export default AdminResult