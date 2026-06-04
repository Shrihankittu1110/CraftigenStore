import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { getAuthHeaders } from "../auth";
import BackButton from "./BackButton";

const addProductSchema = Yup.object().shape({
  name: Yup.string().trim().min(2, "Product name is too short").required("Product name is required"),
  price: Yup.number()
    .typeError("Price must be a valid number")
    .min(50, "Price must be at least Rs 50")
    .max(100000, "Price must be Rs 1,00,000 or less")
    .required("Price is required"),
  category: Yup.string().trim().required("Category is required"),
  material: Yup.string().trim().required("Material is required"),
  description: Yup.string().trim().min(20, "Description should be at least 20 characters").required("Description is required"),
});

const AddProduct = () => {
  const navigate = useNavigate();
  const [selFile, setSelFile] = useState("");

  const addProductForm = useFormik({
    initialValues: {
      name: "",
      category: "decor-item",
      price: "",
      description: "",
      material: "",
      image: "",
    },
    onSubmit: async (values, action) => {
      if (!selFile) {
        Swal.fire({ icon: "warning", title: "Image required", text: "Please upload a product image before adding the item." });
        return;
      }

      const res = await fetch(`${API_BASE_URL}/product/add`, {
        method: "POST",
        body: JSON.stringify({ ...values, image: selFile, price: Number(values.price) }),
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      if (res.status === 200) {
        action.resetForm();
        setSelFile("");
        Swal.fire({ icon: "success", title: "Item Uploaded Successfully" });
        navigate("/productlist");
      } else if (res.status === 403) {
        Swal.fire({ icon: "error", title: "Admin only", text: "Only an admin can add products." });
      } else if (res.status === 400) {
        const data = await res.json().catch(() => null);
        Swal.fire({ icon: "error", title: "Check product details", text: data?.message || "Please enter valid product details." });
      } else {
        Swal.fire({ icon: "error", title: "Error", text: "Something went wrong" });
      }
    },
    validationSchema: addProductSchema,
  });

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("myfile", file);
    const res = await fetch(`${API_BASE_URL}/util/uploadfile`, { method: "POST", body: fd });
    if (res.status === 200) {
      const data = await res.json();
      setSelFile(data.fileName);
    }
  };

  return (
    <main className="page-shell">
      <section className="section-wrap py-12">
        <div className="mx-auto max-w-3xl surface p-6 sm:p-8">
          <BackButton fallback="/profile" />
          <p className="section-kicker">Admin</p>
          <h1 className="section-title mt-2">Add product</h1>
          <p className="section-copy mt-3">Create a clean product entry with pricing, material, and a polished image.</p>
          <form onSubmit={addProductForm.handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label">Item Name</label>
              <p className="error-label">{addProductForm.touched.name && addProductForm.errors.name}</p>
              <input className="field" type="text" name="name" onChange={addProductForm.handleChange} value={addProductForm.values.name} />
            </div>
            <div>
              <label className="field-label">Price</label>
              <p className="error-label">{addProductForm.touched.price && addProductForm.errors.price}</p>
              <input className="field" type="number" name="price" min="50" max="100000" step="1" onChange={addProductForm.handleChange} value={addProductForm.values.price} />
            </div>
            <div>
              <label className="field-label">Category</label>
              <p className="error-label">{addProductForm.touched.category && addProductForm.errors.category}</p>
              <input className="field" type="text" name="category" onChange={addProductForm.handleChange} value={addProductForm.values.category} />
            </div>
            <div>
              <label className="field-label">Material</label>
              <p className="error-label">{addProductForm.touched.material && addProductForm.errors.material}</p>
              <input className="field" type="text" name="material" onChange={addProductForm.handleChange} value={addProductForm.values.material} />
            </div>
            <div>
              <label className="field-label">Upload Image</label>
              <input className="field file:mr-4 file:rounded-full file:border-0 file:bg-emerald-900 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" type="file" onChange={uploadFile} />
              {selFile && <p className="mt-2 text-xs font-bold text-emerald-800">Uploaded: {selFile}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="field-label">Description</label>
              <p className="error-label">{addProductForm.touched.description && addProductForm.errors.description}</p>
              <textarea className="field min-h-32 resize-y" name="description" onChange={addProductForm.handleChange} value={addProductForm.values.description} />
            </div>
            <button type="submit" className="btn-primary sm:col-span-2">Add Item</button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default AddProduct;
