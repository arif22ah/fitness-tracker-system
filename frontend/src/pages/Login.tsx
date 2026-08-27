import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
    } catch {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4">
        <h1 className="text-2xl font-bold text-center">Log in</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-emerald-600 text-white rounded-lg py-2 font-medium hover:bg-emerald-700">
          Log in
        </button>
        <p className="text-sm text-center">
          No account? <Link to="/register" className="text-emerald-600">Register</Link>
        </p>
      </form>
    </div>
  );
}
