import React, { useState } from "react";
import { buildFileUrl } from "../config";

const Avatar = ({ name = "User", src, className = "", textClassName = "" }) => {
  const [failed, setFailed] = useState(false);
  const imageUrl = !failed ? buildFileUrl(src) : "";
  const initial = String(name || "User").trim().charAt(0).toUpperCase() || "U";

  if (imageUrl) {
    return (
      <img
        className={className}
        src={imageUrl}
        alt={name}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={`${className} grid place-items-center bg-emerald-900 font-black text-white ${textClassName}`}>
      {initial}
    </span>
  );
};

export default Avatar;
