const ForCard = ({ title, subtitle, children, className = "for-card" }) => {
  return (
    <div className={className}>
      <div className="card-header">
        {title}
      </div>
      <div className="card-subtitle">
        <h5>{subtitle}</h5>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default ForCard;
