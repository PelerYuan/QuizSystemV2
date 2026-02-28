import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import toast, {Toaster} from "react-hot-toast";
import quizService from "./services/quizzes.js";
import entrancesService from "./services/entrances.js";
import mediaService from "./services/media.js";

import Footer from "./components/partials/Footer";
import Header from "./components/partials/Header";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEdit from "./pages/AdminEdit.jsx";
import AdminTrial from "./pages/AdminTrial";
import AdminResult from "./pages/AdminResult";
import Exam from "./pages/Exam";
import Result from "./pages/Result";
import NotFound from "./pages/NotFound";

const App = () => {
    const [user, setUser] = useState(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedQuizAdmin')
        if (loggedUserJSON) {
            const loggedUser = JSON.parse(loggedUserJSON)
            quizService.setToken(loggedUser.token)
            entrancesService.setToken(loggedUser.token)
            mediaService.setToken(loggedUser.token)
            return loggedUser
        }
        return null
    });

    const [notification, setNotification] = useState({ message: null, type: 'success' })

    const notify = (message, type = 'success') => {
        if (type === 'error') {
            toast.error(message)
        } else if (type === 'warning') {
            toast(message, {
                icon: '⚠️',
                style: {
                    color: '#92400e',
                    backgroundColor: '#fef3c7',
                    border: '2px solid #f59e0b'
                }
            });
        } else
         {
            toast.success(message)
        }
    }

    const handleLogout = () => {
        window.localStorage.removeItem('loggedQuizAdmin')
        setUser(null)
        quizService.setToken(null)
        entrancesService.setToken(null)
        mediaService.setToken(null)
        notify('Logged out successfully', 'success')
    }

    const requireAuth = (element) => {
        return user ? element : <Navigate replace to="/admin/login" />;
    };

    return (
        <div className="flex flex-col min-h-screen bg-brand-50">
            <Router>
                <Header user={user} onLogout={handleLogout} />
                <Toaster position={"top-center"}/>

                {/* flex-1 ensures the main content pushes the footer to the bottom */}
                <main className="flex-1">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home notify={notify}/>} />
                        <Route path="/exam/:accessCode" element={<Exam notify={notify}/>} />
                        <Route path="/result/:submissionId" element={<Result />} />

                        {/* Login Route: Redirect to dashboard if already logged in */}
                        <Route
                            path="/admin/login"
                            element={
                                user
                                    ? <Navigate replace to="/admin/dashboard" />
                                    : <AdminLogin setUser={setUser} notify={notify} />
                            }
                        />

                        {/* Private Admin Routes: Wrapped with requireAuth */}
                        <Route
                            path="/admin/dashboard"
                            element={requireAuth(<AdminDashboard notify={notify} />)}
                        />
                        <Route
                            path="/admin/edit/:quizId"
                            element={requireAuth(<AdminEdit notify={notify} />)}
                        />
                        <Route
                            path="/admin/trial/:quizId"
                            element={requireAuth(<AdminTrial notify={notify} />)}
                        />
                        <Route
                            path="/admin/result/:quizId"
                            element={requireAuth(<AdminResult notify={notify} />)}
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Footer />
            </Router>
        </div>
    );
};

export default App;