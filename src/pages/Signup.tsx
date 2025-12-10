import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import axios from "@/lib/axios";   // ⭐ FIXED IMPORT

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await axios.post("/api/auth/signup", form);  // ⭐ FIXED URL
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <Layout>
      <div className="container max-w-md py-20">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="h-12"
          />

          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="h-12"
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="h-12"
          />

          <Button type="submit" className="w-full h-12">
            Create Account
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default Signup;
