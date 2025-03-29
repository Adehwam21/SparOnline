import { Navigate, useLocation } from 'react-router-dom';
import { ProtectedRouteProps } from '../types';

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    if (!token) {
        // Redirect to the login page if not logged in
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;