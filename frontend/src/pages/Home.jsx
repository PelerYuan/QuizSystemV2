import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import examService from '../services/exam.js'

const Home = ({ notify }) => {
    const [accessCode, setAccessCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = ({ target }) => {
        const formattedCode = target.value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 4)

        setAccessCode(formattedCode)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (accessCode.length !== 4) {
            notify('Access code must be exactly 4 characters.', 'error')
            return
        }

        setIsLoading(true)

        try {
            await examService.getEntrance(accessCode)

            navigate(`/exam/${accessCode}`)

        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid or inactive access code.'
            notify(msg, 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-lg mx-auto mt-20 p-8 sm:p-10 bg-white border border-slate-200 rounded-lg shadow-xl">

            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-brand-900 mb-3 tracking-tight">
                    Join Assessment
                </h1>
                <p className="text-slate-500 text-lg">
                    Enter your 4-character access code to begin
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <input
                        type="text"
                        value={accessCode}
                        name="AccessCode"
                        placeholder="e.g. A1B2"
                        onChange={handleChange}
                        disabled={isLoading}
                        maxLength={4}
                        className="w-full p-4 text-center text-3xl font-mono tracking-[0.5em] border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow box-border uppercase placeholder:normal-case placeholder:text-slate-300 placeholder:tracking-normal"
                        required
                        autoComplete="off"
                        autoFocus
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || accessCode.length !== 4}
                    className={`w-full py-4 rounded font-bold text-lg transition-all
                        ${(isLoading || accessCode.length !== 4)
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-brand-500 text-white shadow-md hover:bg-brand-600 active:scale-95'
                    }`}
                >
                    {isLoading ? 'Verifying...' : 'Start Exam'}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-400">
                    If you haven't received an access code, please contact your instructor.
                </p>
            </div>

        </div>
    )
}

export default Home