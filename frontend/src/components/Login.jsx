import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import useUserContext from "../UserContext";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const { setCurrentUser, setLoggedIn } = useUserContext();

  const loginForm = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit: async (values, action) => {
      try {
        const res = await fetch(`${API_BASE_URL}/user/authenicate`, {
          method: "POST",
          body: JSON.stringify(values),
          headers: { "Content-Type": "application/json" },
        });

        action.resetForm();

        if (res.status === 200) {
          const data = await res.json();
          sessionStorage.setItem("user", JSON.stringify(data));
          setCurrentUser(data);
          setLoggedIn(true);
          Swal.fire({ icon: "success", title: "Login Success" });
          navigate("/home");
        } else if (res.status === 401) {
          Swal.fire({ icon: "error", title: "Login Failed", text: "Email or password is incorrect" });
        } else {
          Swal.fire({ icon: "error", title: "Something Went Wrong" });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Network Error", text: "Please try again shortly" });
      } finally {
        action.setSubmitting(false);
      }
    },
    validationSchema: LoginSchema,
  });

  return (
    <main className="page-shell">
      <section className="section-wrap grid min-h-[calc(100vh-5rem)] items-center py-12 lg:grid-cols-[1fr_460px] lg:gap-12">
        <div className="hidden lg:block">
          <p className="section-kicker">Welcome back</p>
          <h1 className="mt-3 max-w-xl text-5xl font-black leading-tight tracking-tight text-stone-950">
            Continue building a sharper craft marketplace.
          </h1>
          <p className="mt-5 max-w-lg text-stone-600">Access your cart, manage products, and keep your handmade catalogue moving.</p>
        </div>

        <div className="surface p-6 sm:p-8">
          <div className="mb-8">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-900 text-white">
              <i className="fa-solid fa-lock" />
            </div>
            <h2 className="text-3xl font-black text-stone-950">Login</h2>
            <p className="mt-2 text-sm text-stone-600">Enter your details to continue.</p>
          </div>
          <form onSubmit={loginForm.handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Email</label>
              <p className="error-label">{loginForm.touched.email ? loginForm.errors.email : ""}</p>
              <input className="field" placeholder="you@example.com" type="email" name="email" onChange={loginForm.handleChange} value={loginForm.values.email} />
            </div>
            <div>
              <label className="field-label">Password</label>
              <p className="error-label">{loginForm.touched.password ? loginForm.errors.password : ""}</p>
              <input className="field" placeholder="Password" type="password" name="password" onChange={loginForm.handleChange} value={loginForm.values.password} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loginForm.isSubmitting}>
              {loginForm.isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  Logging in, please wait...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-600">
            New here? <Link to="/signup" className="font-black text-emerald-900">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
