const getStoredUser = () => JSON.parse(sessionStorage.getItem("user") || "null");

const isAdminUser = (user) => {
  return user?.role === "admin" || user?.isAdmin === true;
};

const getAuthHeaders = () => {
  const user = getStoredUser();
  const headers = {
    "x-user-id": user?._id || user?.id || "",
    "x-user-email": user?.email || "",
    "x-user-role": isAdminUser(user) ? "admin" : "customer",
  };

  if (user?.token) {
    headers.Authorization = `Bearer ${user.token}`;
  }

  return headers;
};

export { getAuthHeaders, getStoredUser, isAdminUser };
