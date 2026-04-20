import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "researcher" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Create ScholarX Account</h1>
        <input className="w-full rounded border p-2" placeholder="Full Name" required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Email" type="email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="w-full rounded border p-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="researcher">Researcher</option>
          <option value="reviewer">Reviewer</option>
          <option value="editor">Editor</option>
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded bg-blue-600 p-2 text-white" type="submit">Register</button>
        <p className="text-sm">Already have an account? <Link className="text-blue-600" to="/login">Login</Link></p>
      </form>
    </main>
  );
};

export default RegisterPage;
