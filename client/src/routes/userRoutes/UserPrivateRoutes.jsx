import { Navigate, Outlet } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logout } from "../../features/auth/authSlice";
const UserPrivateRoutes = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  if (!token) return <Navigate to="/login" replace />;

  try {
    const { exp } = jwtDecode(token);
    const expired = Date.now() >= exp * 1000;

    if (expired) {
      dispatch(logout());
      return <Navigate to="/login" replace />;
    }
  } catch {
    dispatch(logout());
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default UserPrivateRoutes;
