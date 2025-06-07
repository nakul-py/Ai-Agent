import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import Logo from "./Logo";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Access token and user from Redux store
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    // Dispatch logout action to clear Redux store
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        <Link to="/" className="btn btn-link text-xl">
          <Logo width="25%" />
        </Link>
      </div>
      <div className="flex gap-2">
        {!token ? (
          <>
            <Link
              to="/signup"
              className="btn btn-sm btn-ghost color: white bg-blue-600 hover:bg-blue-700 text-sm"
            >
              Signup
            </Link>
            <Link
              to="/login"
              className="btn btn-sm btn-ghost color: white bg-green-600 hover:bg-green-700 text-sm"
            >
              Login
            </Link>
          </>
        ) : (
          <>
            <Link to="/" className="btn btn-sm btn-ghost text-sm bg-slate-700">
              {"👋 " + (user?.username || "User")}
            </Link>
            <span>
              {user && user?.role === "admin" ? (
                <Link
                  to="/admin"
                  className="btn btn-sm btn-ghost text-sm bg-teal-800"
                >
                  Admin
                </Link>
              ) : null}
            </span>

            <button
              onClick={handleLogout}
              className="btn btn-sm btn-ghost color: white bg-rose-600 hover:bg-rose-800 text-sm"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
