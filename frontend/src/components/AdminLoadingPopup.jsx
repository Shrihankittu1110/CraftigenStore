import React from "react";

const AdminLoadingPopup = ({ title = "Loading", message = "Please wait while we fetch the latest admin data." }) => {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-stone-950/30 px-4 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="w-full max-w-sm rounded-2xl border border-white/80 bg-white p-7 text-center shadow-[0_24px_80px_rgba(24,33,31,0.28)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50">
          <span className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-900" />
        </div>
        <h2 className="mt-5 text-xl font-black text-stone-950">{title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">{message}</p>
      </div>
    </div>
  );
};

export default AdminLoadingPopup;
