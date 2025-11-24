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
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Registration() {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://appointment.shebabingo.com/api/admins/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, userName, password }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      // Save token & admin ID to context
      const token = result.data.token;
      const admin = result.data.admin;
      setAuth({ token, adminId: admin.id });

      setSuccessMessage("Registration successful! Redirecting...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      {/* Success / Error Messages */}
      {errorMessage && (
        <p className="text-red-600 text-center mb-4 font-medium">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-green-600 text-center mb-4 font-medium">{successMessage}</p>
      )}

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Registration</CardTitle>
          <CardDescription className="text-center text-gray-500">
            Please enter your details
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Name */}
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-600">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

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

            {/* Register Button */}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
