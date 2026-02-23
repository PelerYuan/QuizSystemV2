import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="not-found">
      <h2>404 NOT FOUND</h2>
      <p>That page cannot be found</p>
      <Link to={"/"} className="back">Back to the homepage...</Link>
    </div>
  );
};

export default NotFound;
