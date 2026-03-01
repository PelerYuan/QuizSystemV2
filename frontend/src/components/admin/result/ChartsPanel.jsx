import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    ReferenceLine, PieChart, Pie, Legend
} from 'recharts'

const ChartsPanel = ({ sortedScores, pieData, maxScore, averageScore, searchTerm }) => {

    const isMatch = (name) => searchTerm && name.toLowerCase().includes(searchTerm.toLowerCase())

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Score Ranking</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortedScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="studentName" tick={false} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, maxScore]} tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <ReferenceLine y={averageScore} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg', fill: '#f59e0b', fontSize: 12 }} />

                            <Bar dataKey="totalScore" name="Score" radius={[4, 4, 0, 0]} barSize={40}>
                                {sortedScores.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={isMatch(entry.studentName) ? '#f43f5e' : '#0ea5e9'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Score Distribution</h3>
                <p className="text-xs text-slate-500 mb-4">Percentage based on max score</p>

                <div className="h-80 w-full flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, bottom: 20 }}>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="53%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend
                                verticalAlign="bottom"
                                content={(props) => {
                                    const { payload = [] } = props;
                                    if (payload.length === 0) return null;

                                    const orderMap = {
                                        'Excellent (80%+)': 1, 'Good (70-79%)': 2,
                                        'Average (50-69%)': 3, 'Needs Attention (<50%)': 4
                                    };
                                    const sortedPayload = [...payload].sort((a, b) => orderMap[a.value] - orderMap[b.value]);

                                    return (
                                        <div className="flex flex-col gap-2.5 pt-4 pl-4">
                                            {sortedPayload.map((entry, index) => (
                                                <div key={`item-${index}`} className="flex items-center gap-3">
                                                    <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: entry.color }}></span>
                                                    <span className="text-sm font-semibold tracking-wide" style={{ color: entry.color }}>
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
    )
}

export default ChartsPanel