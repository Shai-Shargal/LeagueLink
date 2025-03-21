import React, { useState } from "react";
import "./StartHere.css";

function StartHere() {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="start-here">
      <button className="cta" onClick={handleButtonClick}>
        Start Here
      </button>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}>
              &times;
            </span>
            <h2>Register or Log In</h2>
            <form>
              <label>
                Username:
                <input type="text" name="username" />
              </label>
              <label>
                Password:
                <input type="password" name="password" />
              </label>
              <button type="submit">Submit</button>
            </form>
            <button className="register">Register</button>
            <button className="google-sso">Sign in with Google</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StartHere;
