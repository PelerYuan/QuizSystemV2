'use client';

import { useState, useEffect } from "react";
import Quiz from "../components/admin/Quiz";




// function generateRandomCode4() {
//   const POOL = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   let code = "";

//   for (let i = 0; i < 4; i += 1) {
//     const idx = Math.floor(Math.random() * POOL.length);
//     code += POOL[idx];
//   }
//   return code;
// }




const AdminDashboard = () => {
  const [data, setData] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("secretToken");
        if (!token) {
          setError("No authentication token found. Please log in.");
          return;
        }

        const response = await fetch("/api/quizzes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}` 
          }
        });

        const jsonData = await response.json().catch(() => {
          throw new Error("Invalid response from server");
        }
        );

        if (!response.ok) {
          const message = jsonData.message || "Failed to fetch quizzes";
          throw new Error(message);
        }
        console.log(jsonData);
        setData(jsonData);

      } catch (error) {
        setError(error.message || "An error occurred while fetching quizzes");
      } finally {
        setLoading(false);
      }
    };
  })

  
  return (
    <main className="admin-page">
      <section className="admin-hero">
        <h1>Quiz Management</h1>
        <p>Manage your quizzes and exams</p>
      </section>

      <section className="admin-content">
        <div className="admin-content-header">
          <h2>Available Quizzes</h2>
          <div className="admin-actions">
            <a className="btn btn-primary" href="/admin/editor/new">
              CREATE NEW QUIZ
            </a>
            <label className="btn btn-secondary" htmlFor="importJson">
              IMPORT FROM JSONa
            </label>
            <input
              id="importJson"
              type="file"
              accept="application/json"
              className="visually-hidden"
            />
          </div>
        </div>
      </section>

      {data.map((quiz) => (
        <Quiz />
      ))}




    </main>
  )
}

export default AdminDashboard
