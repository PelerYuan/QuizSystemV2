import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";

import Footer from "./components/partials/Footer";
import Header from "./components/partials/Header";
import Notification from "./components/Notification.jsx";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEdit from "./pages/AdminEdit.jsx";
import AdminTrial from "./pages/AdminTrial";
import AdminResult from "./pages/AdminResult";
import Exam from "./pages/Exam";
import Result from "./pages/Result";
import NotFound from "./pages/NotFound";
import quizService from "./services/quizzes.js";
import {use, useEffect, useState} from "react";


const App = () => {
    const [user, setUser] = useState(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedQuizAdmin')
        if (loggedUserJSON) {
            const loggedUser = JSON.parse(loggedUserJSON)
            quizService.setToken(loggedUser.token)
            return loggedUser
        }
        return null
    });

    const [notification, setNotification] = useState({message: null, type: 'success'})
    const notify = (message, type = 'success') => {
        setNotification({message, type})
        setTimeout(() => {
            setNotification({message: null, type: 'success'})
        }, 5000)
    }

    const handleLogout = () => {
        window.localStorage.removeItem('loggedQuizAdmin')
        setUser(null)
        // Register HERE
        quizService.setToken(null)
        notify('Logged out successfully')
    }

    return (
        <div className="app-container">
            <Router>
                <Header user={user} onLogout={handleLogout}/>
                <Notification notification={notification}/>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route
                            path="/admin/login"
                            element={user ? <Navigate replace to="/admin/dashboard"/> :
                                <AdminLogin setUser={setUser} notify={notify}/>}
                        />
                        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
                        <Route path="/admin/edit/:quizId" element={<AdminEdit/>}/>
                        <Route path="/admin/trial/:quizId" element={<AdminTrial/>}/>
                        <Route path="/admin/result/:quizId" element={<AdminResult/>}/>
                        <Route path="/exam/:quizId" element={<Exam/>}/>
                        <Route path="/result/:quizId" element={<Result/>}/>

                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </div>
                <Footer/>
            </Router>
        </div>
    );
};

export default App;
