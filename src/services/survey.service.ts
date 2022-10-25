import { authHeader } from "../utils/auth-header";
import { handleResponse } from "../utils/handle-response";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export async function getAccumulatedResponse(surveySelectId: number) {
    const requestOptions: RequestInit = {
        method: "GET",
        headers: authHeader(),
    };
    const response = await fetch(`${SERVER_URL}/api/survey-response-select-accumulated?surveyId=${surveySelectId}`, requestOptions);
    return handleResponse(response);
}

export async function deleteSurveySelect(surveySelectId: number) {
    const requestOptions: RequestInit = {
        method: "GET",
        headers: authHeader(),
    };
    const response = await fetch(`${SERVER_URL}/api/survey-select-delete?surveyId=${surveySelectId}`, requestOptions);
    return handleResponse(response);
}