import ForCard from "./ForCard.jsx";

const ForTeachers = () => {
  return (
    <ForCard title="For Teachers" subtitle={"Ready to take a quiz?"}>
      <p>
        Teachers can create and manage quizzes through the admin panel. You can
        generate unique links for each assessment session.
      </p>
      <a href="/admin/login" className="admin-login">Admin Login</a>
    </ForCard>
  );
};

export default ForTeachers;
