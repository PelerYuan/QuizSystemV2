import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Footer from "./components/partials/Footer";
import Home from "./pages/Home";
import Header from "./components/partials/Header";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEdit from "./pages/AdminEdit.jsx";
import AdminTrial from "./pages/AdminTrial";
import AdminResult from "./pages/AdminResult";
import Exam from "./pages/Exam";
import Result from "./pages/Result";
import NotFound from "./pages/NotFound";


const App = () => {
  return (
    <div className="app-container">
      <Router>
        <Header />
				<div className="App">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/admin/login" element={<AdminLogin />} />
						<Route path="/admin/dashboard" element={<AdminDashboard />} />
						<Route path="/admin/edit/:quizId" element={<AdminEdit />} />
						<Route path="/admin/trial/:quizId" element={<AdminTrial />} />
						<Route path="/admin/result/:quizId" element={<AdminResult />} />
						<Route path="/exam/:quizId" element={<Exam />} />
						<Route path="/result/:quizId" element={<Result />} />

						<Route path="*" element={<NotFound />} />
					</Routes>
					</div>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
