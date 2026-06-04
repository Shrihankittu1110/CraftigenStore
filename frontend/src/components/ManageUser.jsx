import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { API_BASE_URL, buildFileUrl } from "../config";
import { getAuthHeaders } from "../auth";
import BackButton from "./BackButton";

const ManageUser = () => {
  const [userList, setUserList] = useState([]);

  const fetchUserData = async () => {
    const res = await fetch(`${API_BASE_URL}/user/getall`, { headers: getAuthHeaders() });
    if (res.status === 200) {
      const data = await res.json();
      setUserList(data);
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
                {userList.map((user) => (
                  <tr key={user._id} className="transition hover:bg-emerald-50/70">
                    <td className="px-5 py-4 font-bold text-stone-950">{user.name}</td>
                    <td className="px-5 py-4 text-stone-600">{user.email}</td>
                    <td className="px-5 py-4">
                      <img className="h-12 w-12 rounded-full object-cover" src={buildFileUrl(user.avatar)} alt={user.name} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-900">
                        {user.role || "customer"}
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
        </div>
      </section>
    </main>
  );
};

export default ManageUser;
