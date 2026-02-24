import ForCard from "./ForCard.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function InputEntrance() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const go = () => {
    const value = code.trim();
    if (!value) return;

    navigate(`/quiz/${encodeURIComponent(value)}`);
    // 或 navigate(`/quiz?code=${encodeURIComponent(value)}`);
  };

  return (
    <div className="input-entrance" style={{ display: "flex", gap: 12 }}>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter quiz code"
        onKeyDown={(e) => e.key === "Enter" && go()}
      />
      <button onClick={go}>Go</button>
    </div>
  );
}







const ForStudents = () => {
  return (
    <ForCard title="For Students" subtitle={"Ready to take a quiz?"}>
      <p>
        You'll need a quiz link from your teacher to access your assessment. The
        link will direct you to a login page where you can enter your name
        before starting the quiz. Once you've completed the quiz, you'll receive
        immediate feedback on your performance.
      </p>
      <InputEntrance /> 
    </ForCard>
  );
};

export default ForStudents;
