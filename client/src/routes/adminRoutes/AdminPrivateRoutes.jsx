import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logoutAdmin } from "../../features/admin/adminAuthSlice";

const AdminPrivateRoutes = () => {
  const dispatch = useDispatch();

  const token = useSelector((state) => state.adminAuth.token);
  const admin = useSelector((state) => state.adminAuth.admin);

  if (!token) return <Navigate to="/admin/login" replace />;

  try {
    const decoded = jwtDecode(token);

    if (Date.now() >= decoded.exp * 1000) {
      dispatch(logoutAdmin());
      return <Navigate to="/admin/login" replace />;
    }

    if (decoded.role !== "admin" && decoded.role !== "superadmin") {
      dispatch(logoutAdmin());
      return <Navigate to="/admin/login" replace />;
    }

    if (admin && admin.status && admin.status !== "approved") {
      dispatch(logoutAdmin());
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    dispatch(logoutAdmin());
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminPrivateRoutes;
