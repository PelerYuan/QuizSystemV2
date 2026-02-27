// src/components/partials/Header.jsx
import {Link} from 'react-router-dom'

const Header = ({user, onLogout}) => {
    return (<header className="bg-brand-900 text-white shadow-md px-8 py-4 flex justify-between items-center">
            <div>
                <Link to="/" className="text-2xl font-bold tracking-wider hover:text-brand-100 transition-colors">
                    QuizSystem
                </Link>
            </div>

            <nav className="flex items-center gap-6">
                {user ? (<>
                        <Link to="/admin/dashboard" className="font-semibold hover:text-brand-100 transition">
                            Dashboard
                        </Link>
                        <div className="h-5 border-l border-brand-600"></div>
                        <span className="text-brand-100 italic text-sm">Welcome, Admin</span>
                        <button
                            onClick={onLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded shadow transition-all active:scale-95"
                        >
                            Logout
                        </button>
                    </>) : (<>
                        <Link to="/" className="font-semibold hover:text-brand-100 transition">Student Portal</Link>
                        <Link
                            to="/admin/login"
                            className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-5 rounded shadow-md transition-transform active:scale-95"
                        >
                            Teacher Login
                        </Link>
                    </>)}
            </nav>
        </header>)
}

export default Header