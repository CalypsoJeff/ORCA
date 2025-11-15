import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

const UserPrivateRoutes = () => {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default UserPrivateRoutes;
