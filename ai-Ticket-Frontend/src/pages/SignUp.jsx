import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Logo from "../components/Logo";

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = React.useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const serverUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
      console.log("Server URL:", serverUrl);

      const res = await fetch(`${serverUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Signup success:", data);

      if (res.ok) {
        dispatch(login({ token: data.token, user: data.user }));
        navigate("/");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (error) {
      setError("Something went wrong, please try again later");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm shadow-xl bg-base-100">
        <div className="flex card-header justify-center pt-6">
          <Logo width="30%" />
        </div>
        <form onSubmit={handleSignup} className="card-body">
          <h2 className="card-title justify-center">Sign Up</h2>
          <p className="mt-2 text-center text-base text-white/60">
            Already have an account?&nbsp;
            <Link
              to="/login"
              className="font-medium text-primary transition-all duration-200 hover:underline  hover:text-blue-600"
            >
              Sign In
            </Link>
          </p>

          <input
            type="text"
            name="username"
            placeholder="Username"
            className="input input-secondary w-full text-sm"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input input-primary w-full text-sm"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="input input-success w-5/6 pr-10 text-sm"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Display error message */}
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div className="form-control mt-4">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
