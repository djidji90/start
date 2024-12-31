import { useAuth } from './hook/UseAut';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
    const { authToken } = useAuth();

    return authToken ? children : <Navigate to="/SinginPage" />;
}