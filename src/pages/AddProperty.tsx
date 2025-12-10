import { useState } from "react";
import axios from "@/lib/axios";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AddProperty = () => {
  const navigate = useNavigate();  

  const [form, setForm] = useState({
    title: "",
    price: "",
    location: "",
    description: "",
    image_url: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await axios.post("/api/properties/", {
  ...form,
  price: Number(form.price),
});


    alert("Property added successfully!");
    navigate("/properties");  

  } catch (error) {
    console.error(error);
    alert("Failed to add property");
  }
};

  return (
    <Layout>
      <div className="container max-w-xl py-10">
        <h1 className="text-3xl font-bold mb-6">Add Property</h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <input
            name="image_url"
            placeholder="Image URL"
            value={form.image_url}
            onChange={handleChange}
            className="w-full border p-3 rounded"
          />

          <Button className="w-full" type="submit">
            Add Property
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default AddProperty;
