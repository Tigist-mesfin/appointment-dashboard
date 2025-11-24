import { useState, useContext } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { loginAdmin } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";


export default function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {

  e.preventDefault(); // prevents page reload
  setErrorMessage("");
  setSuccessMessage("");
  setLoading(true);

  try {
    const result = await loginAdmin(userName, password);
    const token = result.data.token;
    const admin = result.data.admin;

    setAuth({ token, adminId: admin.id });

    setSuccessMessage("Login successful! Redirecting...");
    // Optional: delay navigation so user can see message
    

    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1500);
  } catch (err) {
    setErrorMessage(err.response?.data?.message || "Login failed");
      setTimeout(() => {
      setErrorMessage("");
    }, 3000);
  } finally {
    setLoading(false);
  }
};


  return (
   <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
  {/* Success & Error Messages */}
  {errorMessage && (
    <p className="text-red-600 text-center mb-3 font-medium">
      {errorMessage}
    </p>
  )}
  {successMessage && (
    <p className="text-green-600 text-center mb-3 font-medium">
      {successMessage}
    </p>
  )}

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
          <CardDescription className="text-center text-gray-500">
            Please enter your credentials
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Username */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-600">
                Username
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter username"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Login Button */}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
             <Link to="/register" className="text-blue-500 cursor-pointer">
               Sign Up
             </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );}
