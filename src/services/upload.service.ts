import { authHeader } from "../utils/auth-header";
import { handleResponse } from "../utils/handle-response";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
/**
 * Uploads a file to the STRAPI Upload API
 * @param files the file object to upload
 * @param entityId the uid of the entity
 * @param refId the id of the entry to connect to
 * @param field the field of the entry to connect to
 * @returns 
 */
export async function uploadFiles(files: File[], entityId: string, refId: number, field: string) {
    var headers = authHeader();
    var formData = new FormData();
    formData.append("ref", `api::${entityId}.${entityId}`);
    formData.append("refId", `${refId}`);
    formData.append("field", field);
    files.forEach((file) => formData.append("files", file));
    const requestOptions: RequestInit = {
        method: "POST",
        headers: headers,
        body: formData
    };
    const response = await fetch(`${SERVER_URL}/api/upload`, requestOptions);
    return handleResponse(response);
}

export async function deleteFile(fileId: number) {
    var headers = authHeader();
    const requestOptions: RequestInit = {
        method: "DELETE",
        headers: headers,
    };
    const response = await fetch(`${SERVER_URL}/api/upload/files/${fileId}`, requestOptions);
    return handleResponse(response);
}

export function getImageUrl(imageValue: any) {
    if (imageValue == null || imageValue.data == null) return '';
    return `${SERVER_URL}${imageValue.data.attributes.url}`;
}

export function getImageUrls(imageValue: any) {
    if (imageValue == null || imageValue.data == null) return [];
    return imageValue.data.map((item: any) => `${SERVER_URL}${item.attributes.url}`);
}