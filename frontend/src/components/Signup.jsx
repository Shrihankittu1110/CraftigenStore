import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const signupSchema = Yup.object().shape({
  name: Yup.string().min(2, "Too Short!").max(50, "Too Long!").required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string()
    .required("Please enter your password")
    .min(6, "Use at least 6 characters"),
});

const Signup = () => {
  const navigate = useNavigate();
  const [avatarPath, setAvatarPath] = useState("");

  const signupForm = useFormik({
    initialValues: { name: "", email: "", password: "" },
    onSubmit: async (values, action) => {
      const res = await fetch(`${API_BASE_URL}/user/add`, {
        method: "POST",
        body: JSON.stringify({ ...values, avatar: avatarPath }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.status === 200) {
        Swal.fire({ icon: "success", title: "Signup Success", text: "Now login to continue" });
        action.resetForm();
        navigate("/login");
      } else {
        Swal.fire({ icon: "error", title: "Oops", text: "Some error occurred" });
      }
    },
    validationSchema: signupSchema,
  });

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("myfile", file);

    const res = await fetch(`${API_BASE_URL}/util/uploadfile`, { method: "POST", body: fd });
    if (res.status === 200) {
      const data = await res.json();
      setAvatarPath(data.fileName);
    }
  };

  return (
    <main className="page-shell">
      <section className="section-wrap grid min-h-[calc(100vh-5rem)] items-center py-12 lg:grid-cols-[1fr_500px] lg:gap-12">
        <div className="hidden lg:block">
          <p className="section-kicker">Join Craftigen</p>
          <h1 className="mt-3 max-w-xl text-5xl font-black leading-tight tracking-tight text-stone-950">
            A cleaner account flow for a better marketplace.
          </h1>
          <p className="mt-5 max-w-lg text-stone-600">Create your profile and start exploring curated craft collections with a polished experience.</p>
        </div>
        <div className="surface p-6 sm:p-8">
          <h2 className="text-3xl font-black text-stone-950">Create account</h2>
          <p className="mt-2 text-sm text-stone-600">Use at least 6 characters for your password.</p>
          <form onSubmit={signupForm.handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="field-label">Name</label>
              <p className="error-label">{signupForm.touched.name ? signupForm.errors.name : ""}</p>
              <input className="field" type="text" name="name" onChange={signupForm.handleChange} value={signupForm.values.name} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <p className="error-label">{signupForm.touched.email ? signupForm.errors.email : ""}</p>
              <input className="field" type="email" name="email" onChange={signupForm.handleChange} value={signupForm.values.email} />
            </div>
            <div>
              <label className="field-label">Password</label>
              <p className="error-label">{signupForm.touched.password ? signupForm.errors.password : ""}</p>
              <input className="field" type="password" name="password" onChange={signupForm.handleChange} value={signupForm.values.password} />
            </div>
            <div>
              <label className="field-label">Profile avatar</label>
              <input className="field file:mr-4 file:rounded-full file:border-0 file:bg-emerald-900 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" type="file" onChange={uploadFile} />
              {avatarPath && <p className="mt-2 text-xs font-bold text-emerald-800">Uploaded: {avatarPath}</p>}
            </div>
            <button type="submit" className="btn-primary w-full">Sign Up</button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-600">
            Already registered? <Link to="/login" className="font-black text-emerald-900">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Signup;
