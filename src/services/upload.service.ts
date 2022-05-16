import { authHeader } from "../utils/auth-header";
import { handleResponse } from "../utils/handle-response";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
/**
 * Uploads a file to the STRAPI Upload API
 * @param file the file object to upload
 * @param ref the uid of the model
 * @param refId the id of the entry to connect to
 * @param field the field of the entry to connect to
 * @returns 
 */
async function _uploadFile(file: File, ref: string, refId: string, field: string) {
    var headers = authHeader();
    headers["Content-Type"] = "application/json";
    var formData = new FormData();
    formData.append("ref", ref);
    formData.append("refId", refId);
    formData.append("field", field);
    formData.append("files", file);
    const requestOptions: RequestInit = {
        method: "POST",
        headers: headers,
        body: formData
    };
    const response = await fetch(`${SERVER_URL}/api/upload`, requestOptions);
    return handleResponse(response);
}

