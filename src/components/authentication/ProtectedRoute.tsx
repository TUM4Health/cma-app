import { Navigate } from 'react-router-dom';
import { authenticationService } from '../../services/authentication.service';


export type ProtectedRouteProps = {
    authenticationPath: string;
    outlet: JSX.Element;
};

export default function ProtectedRoute({ authenticationPath, outlet }: ProtectedRouteProps) {
    if (authenticationService.currentUserValue.jwt != null) {
        return outlet;
    } else {
        return <Navigate to={{ pathname: authenticationPath }} />;
    }
};
