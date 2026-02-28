import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useUser } from "./contexts/UserContext.jsx";
import { useNotification } from "./contexts/NotificationContext.jsx";

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
    const { user, logout, isLoading } = useUser();
    const { notify } = useNotification();

    const handleLogout = () => {
        logout();
        notify('Logged out successfully', 'success');
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-50">Loading...</div>;
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
                        <Route path="/" element={<Home />} />
                        <Route path="/exam/:accessCode" element={<Exam />} />
                        <Route path="/result/:submissionId" element={<Result />} />

                        {/* Login Route: Redirect to dashboard if already logged in */}
                        <Route
                            path="/admin/login"
                            element={
                                user
                                    ? <Navigate replace to="/admin/dashboard" />
                                    : <AdminLogin />
                            }
                        />

                        {/* Private Admin Routes: Wrapped with requireAuth */}
                        <Route
                            path="/admin/dashboard"
                            element={requireAuth(<AdminDashboard />)}
                        />
                        <Route
                            path="/admin/edit/:quizId"
                            element={requireAuth(<AdminEdit />)}
                        />
                        <Route
                            path="/admin/trial/:quizId"
                            element={requireAuth(<AdminTrial />)}
                        />
                        <Route
                            path="/admin/result/:entranceId"
                            element={requireAuth(<AdminResult />)}
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