import React from "react";
import { useNavigate } from "react-router-dom";

const BackButton = ({ fallback = "/home", label = "Back" }) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallback);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-black text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-800 hover:text-emerald-900"
    >
      <i className="fa-solid fa-arrow-left" />
      {label}
    </button>
  );
};

export default BackButton;
