import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkTokenValidity } from "../utils/auth";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      checkTokenValidity(token).then((isValid) => {
        if (!isValid) {
          localStorage.clear();
        }
        setIsAuthenticated(isValid);
      });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
