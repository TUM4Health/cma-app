import { authenticationService } from "../services/authentication.service";

export function authHeader(): { [key: string]: string } {
    // return authorization header with jwt token
    const currentUser = authenticationService.currentUserValue;
    if (currentUser && currentUser.jwt) {
        return { Authorization: `Bearer ${currentUser.jwt}` };
    } else {
        return {};
    }
}
