import ForStudents from "../components/home/ForStudents";
import ForTeachers from "../components/home/ForTeachers";
import ImportantNote from "../components/home/ImportantNote";
import Welcome from "../components/home/Welcome";

const Home = () => {
  return (
    <div>
      <h1>Home</h1>
      <Welcome />
      <ForStudents />
      <ForTeachers />
      <ImportantNote />
    </div>
  );
};

export default Home;
