import React from "react";
import { useFormik } from "formik";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../config";

const ContactUs = () => {
  const contactForm = useFormik({
    initialValues: { name: "", email: "", message: "" },
    onSubmit: async (values, action) => {
      const res = await fetch(`${API_BASE_URL}/contact/add`, {
        method: "POST",
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
      });
      action.resetForm();

      if (res.status === 200) {
        Swal.fire({ icon: "success", title: "Thank You", text: "Team will contact you shortly" });
      } else {
        Swal.fire({ icon: "error", title: "Oops", text: "Some error occurred" });
      }
    },
  });

  return (
    <main className="page-shell">
      <section className="section-wrap grid min-h-[calc(100vh-5rem)] items-center gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="section-kicker">Contact</p>
          <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight text-stone-950">Let’s make the store better.</h1>
          <p className="mt-5 section-copy">Send questions, feedback, or supplier requests. We’ll keep the response clear and useful.</p>
        </div>
        <div className="surface p-6 sm:p-8">
          <form onSubmit={contactForm.handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">Name</label>
              <input className="field" type="text" name="name" onChange={contactForm.handleChange} value={contactForm.values.name} />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="field" type="email" name="email" onChange={contactForm.handleChange} value={contactForm.values.email} />
            </div>
            <div>
              <label className="field-label">Message</label>
              <textarea className="field min-h-36 resize-y" name="message" onChange={contactForm.handleChange} value={contactForm.values.message} />
            </div>
            <button type="submit" className="btn-primary w-full">Submit Message</button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default ContactUs;
