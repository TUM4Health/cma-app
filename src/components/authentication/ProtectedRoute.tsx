import { Navigate } from 'react-router-dom';
import { authenticationService } from '../../services/authentication.service';


export type ProtectedRouteProps = {
    isAuthenticated: boolean;
    authenticationPath: string;
    outlet: JSX.Element;
};

export default function ProtectedRoute({ isAuthenticated, authenticationPath, outlet }: ProtectedRouteProps) {
    console.log(authenticationService.currentUserValue);

    if (isAuthenticated) {
        return outlet;
    } else {
        return <Navigate to={{ pathname: authenticationPath }} />;
    }
};
