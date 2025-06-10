import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Auth({ children, protected: isProtected }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Access the token from the Redux store
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (isProtected && !token) {
      navigate("/login", { replace: true });
    } else if (!isProtected && token) {
      navigate("/", { replace: true });
    } else {
      setLoading(false);
    }
  }, [navigate, isProtected, token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}

export default Auth;
