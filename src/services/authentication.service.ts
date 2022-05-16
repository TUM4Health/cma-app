import { BehaviorSubject } from "rxjs";
import { handleResponse } from "../utils/handle-response";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const currentUserSubject = new BehaviorSubject(
    JSON.parse(localStorage.getItem("currentUser") ?? "{}")
);

export const authenticationService = {
    login,
    logout,
    currentUser: currentUserSubject.asObservable(),
    get currentUserValue() {
        return currentUserSubject.value == null
            ? null
            : currentUserSubject.value;
    },
};

async function login(email: string, password: string) {
    const requestOptions: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            identifier: email,
            password: password,
        }),
        // credentials: "include",
    };

    const response = await fetch(`${SERVER_URL}/api/auth/local`, requestOptions);
    const user = await handleResponse(response);
    // store user details and jwt token in local storage to keep user logged in between page refreshes
    localStorage.setItem("currentUser", JSON.stringify(user));
    currentUserSubject.next(user);
    return user;
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("currentUser");
    currentUserSubject.next(null);
    // window.location.pathname = "/login";
    // window.location.reload();
}
