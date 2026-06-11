import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { API_BASE_URL } from "../config";
import { getAuthHeaders, getStoredUser } from "../auth";
import BackButton from "./BackButton";

const updateUserSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters").required("Name is required"),
  email: Yup.string().email("Email is invalid").required("Email is required"),
  password: Yup.string()
    .test("password-empty-or-strong", "Password must be at least 6 characters and cannot contain spaces", (value) => {
      if (!value) return true;
      return /^\S{6,}$/.test(value);
    }),
});

const UpdateUser = () => {
  const navigate = useNavigate();
  const [uploadedAvatar, setUploadedAvatar] = useState("");
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const currentUser = getStoredUser();
  const isOwnProfile = String(currentUser?._id || currentUser?.id) === String(id);

  const fetchUserData = async () => {
    const res = await fetch(`${API_BASE_URL}/user/getid/` + id, { headers: getAuthHeaders() });
    const data = await res.json();
    setUserData(data);
  };

  useEffect(() => {
    if (!isOwnProfile) {
      Swal.fire({
        icon: "warning",
        title: "Not allowed",
        text: "You can update only your own profile.",
      });
      navigate("/home");
      return;
    }

    fetchUserData();
  }, [id]);

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("myfile", file);

    const res = await fetch(`${API_BASE_URL}/util/uploadfile`, { method: "POST", body: fd });
    if (res.status === 200) {
      const data = await res.json();
      setUploadedAvatar(data.fileName);
    }
  };

  return (
    <main className="page-shell">
      <section className="section-wrap grid min-h-[calc(100vh-5rem)] place-items-center py-12">
        <div className="w-full max-w-xl surface p-6 sm:p-8">
          <BackButton fallback="/profile" />
          <p className="section-kicker">Profile</p>
          <h1 className="section-title mt-2">Edit profile</h1>
          {userData !== null ? (
            <Formik
              initialValues={{ ...userData, password: "" }}
              validationSchema={updateUserSchema}
              onSubmit={async (values) => {
                const payload = { ...values };
                if (uploadedAvatar) payload.avatar = uploadedAvatar;
                if (!payload.password) delete payload.password;
                const res = await fetch(`${API_BASE_URL}/user/update/` + id, {
                  method: "PUT",
                  body: JSON.stringify(payload),
                  headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                });

                if (res.status === 200) {
                  const updatedUser = await res.json();
                  if (isOwnProfile) {
                    sessionStorage.setItem("user", JSON.stringify(updatedUser));
                  }
                  Swal.fire({ icon: "success", title: "Update Success" });
                  navigate("/profile");
                } else {
                  Swal.fire({ icon: "error", title: "Oops", text: "Some error occurred" });
                }
              }}
            >
              {({ values, handleSubmit, handleChange, touched, errors }) => (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div>
                    <label className="field-label">Name</label>
                    <p className="error-label">{touched.name ? errors.name : ""}</p>
                    <input className="field" type="text" name="name" onChange={handleChange} value={values.name} />
                  </div>
                  <div>
                    <label className="field-label">Email</label>
                    <p className="error-label">{touched.email ? errors.email : ""}</p>
                    <input className="field" type="email" name="email" onChange={handleChange} value={values.email} />
                  </div>
                  <div>
                    <label className="field-label">New password</label>
                    <p className="error-label">{touched.password ? errors.password : ""}</p>
                    <input className="field" type="password" name="password" onChange={handleChange} value={values.password || ""} />
                  </div>
                  <div>
                    <label className="field-label">Avatar</label>
                    <input className="field file:mr-4 file:rounded-full file:border-0 file:bg-emerald-900 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" type="file" onChange={uploadFile} />
                    {uploadedAvatar && <p className="mt-2 text-xs font-bold text-emerald-800">Uploaded: {uploadedAvatar}</p>}
                  </div>
                  <button type="submit" className="btn-primary w-full">Update User</button>
                </form>
              )}
            </Formik>
          ) : (
            <div className="mt-8 rounded-2xl bg-white/80 p-6 text-center font-bold text-stone-600">Loading...</div>
          )}
        </div>
      </section>
    </main>
  );
};

export default UpdateUser;
