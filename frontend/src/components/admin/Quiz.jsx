import CopyButton from "../CopyButton";




const showEntrance = (quizId, ori_entrances) => {
  entrances = ori_entrances.filter((entrance) => entrance.quizId === quizId)

  entrances.map((entrance) => { 
    const copyLink = `${window.location.origin}/admin/result/${entrance._id}`;
    return (
      <div className="entrance">
        <button type="button" className="add-entrance">
          + Add Entrance
        </button>
        <div key={entrance._id} className="entrance">
          <h3>{entrance.name}</h3>
          <p>{entrance.description}</p>
          <h4>Status: {entrance.isActive}</h4>
        </div>
        <div className="operations">
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginLeft: "12px" }}
          >
            DELETE
          </button>
          <button type="button" className="btn btn-primary">
            CHECK RESULTS
          </button>
          <CopyButton text={copyLink} />
        </div>
      </div>
    );
  })
}


function Quiz({ props }) {
  
  return (
    <div className="quiz">
      <h3>{props.name}</h3>
      <p>{props.description}</p>

      <div className="operations">
        <button type="button" className="btn btn-primary">EDIT</button>
        <button type="button" className="btn btn-secondary" style={{ marginLeft: '12px' }}>DELETE</button>
        <button type="button" className="btn btn-secondary" style={{ marginLeft: '12px' }}>TRAIL</button>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginLeft: '12px' }}
          onClick={() => showEntrance(props.id)}
        >
          Manage Entrance
        </button>
      </div>
    </div>
  )
}

export default Quiz