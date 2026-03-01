import { Link, useNavigate } from 'react-router-dom'

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-brand-50/30 px-6 py-24 font-sans">
            <div className="text-center max-w-lg mx-auto">

                <div className="relative inline-block mb-8">
                    <h1 className="text-[9rem] leading-none font-black text-brand-600 drop-shadow-lg select-none">
                        404
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand-400/20 blur-3xl rounded-full -z-10"></div>
                </div>

                <div className="w-16 h-1.5 bg-brand-500 mx-auto mb-8 rounded-full"></div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
                    Oops! Page Not Found
                </h2>
                <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-full shadow-sm transition-all active:scale-95"
                    >
                        Go Back
                    </button>

                    <Link
                        to="/"
                        className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95"
                    >
                        Return Home
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default NotFound