import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ user }) {
  const location = useLocation();
  return user ? <Outlet /> : <Navigate replace to="/login" state={{ from: location }} />;
}
