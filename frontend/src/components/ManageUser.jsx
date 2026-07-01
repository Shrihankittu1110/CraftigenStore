import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../config";
import { getAuthHeaders } from "../auth";
import AdminLoadingPopup from "./AdminLoadingPopup";
import Avatar from "./Avatar";
import BackButton from "./BackButton";

const ManageUser = () => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const getDisplayRole = (user) => (user.email?.toLowerCase() === "admin123@gmail.com" ? "admin" : user.role);
  const isVisibleUser = (user) => ["admin", "customer"].includes(getDisplayRole(user));

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/getall`, { headers: getAuthHeaders() });
      if (res.status === 200) {
        const data = await res.json();
        setUserList(data.filter(isVisibleUser));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const deleteUser = async (id) => {
    const res = await fetch(`${API_BASE_URL}/user/delete/` + id, { method: "DELETE", headers: getAuthHeaders() });
    if (res.status === 200) {
      fetchUserData();
      toast.success("User deleted successfully");
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <main className="page-shell">
      {loading && (
        <AdminLoadingPopup
          title="Loading users"
          message="Preparing the latest customer and admin account list."
        />
      )}

      <section className="section-wrap py-12">
        <div className="mb-8">
          <BackButton fallback="/profile" />
          <p className="section-kicker">Admin</p>
          <h1 className="section-title mt-2">Manage users</h1>
        </div>
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-stone-950 text-white">
                <tr>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Avatar</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Joined</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 bg-white/70">
                {!loading && userList.map((user) => (
                  <tr key={user._id} className="transition hover:bg-emerald-50/70">
                    <td className="px-5 py-4 font-bold text-stone-950">{user.name}</td>
                    <td className="px-5 py-4 text-stone-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <Avatar className="h-12 w-12 rounded-full object-cover text-sm" src={user.avatar} name={user.name} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-900">
                        {getDisplayRole(user)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-600">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="btn-danger" onClick={() => deleteUser(user._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && userList.length === 0 && (
            <div className="border-t border-stone-200 bg-white/80 p-10 text-center font-bold text-stone-600">
              No users found.
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ManageUser;
