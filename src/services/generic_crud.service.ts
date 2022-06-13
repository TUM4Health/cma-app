import { authHeader } from "../utils/auth-header";
import { handleResponse } from "../utils/handle-response";

export interface NamedFile {
    name: string,
    fileName?: string,
    file: File
}

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
export function genericCrudService(path: string) {
    const getSingle = (id: number) => _getSingle(path, id);
    const getAll = () => _getAll(path);
    const update = (data: any, id: number) => _update(data, id, path);
    const create = (data: any) => _create(data, path);
    const createWithFiles = (data: any, files: NamedFile[]) => _createWithFiles(data, files, path);
    const deleteEntity = (id: number) => _deleteEntity(id, path);
    return {
        getSingle,
        getAll,
        update,
        create,
        createWithFiles,
        deleteEntity,
    };
}

async function _getSingle(path: string, id: number) {
    const requestOptions: RequestInit = {
        method: "GET",
        headers: authHeader(),
    };
    const response = await fetch(`${SERVER_URL}/api/${path}/${id}?populate=*&publicationState=preview`, requestOptions);
    return handleResponse(response);
}

async function _getAll(path: string) {
    const requestOptions: RequestInit = {
        method: "GET",
        headers: authHeader(),
    };
    const response = await fetch(`${SERVER_URL}/api/${path}?populate=*&publicationState=preview`, requestOptions);
    return handleResponse(response);
}

async function _update(data: any, id: number, path: string) {
    var headers = authHeader();
    headers["Content-Type"] = "application/json";
    const requestOptions: RequestInit = {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(data),
    };
    const response = await fetch(`${SERVER_URL}/api/${path}/${id}`, requestOptions);
    return handleResponse(response);
}

async function _create(data: any, path: string) {
    var headers = authHeader();
    headers["Content-Type"] = "application/json";
    const requestOptions: RequestInit = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
    };
    const response = await fetch(`${SERVER_URL}/api/${path}`, requestOptions);
    return handleResponse(response);
}

async function _createWithFiles(data: any, files: NamedFile[], path: string) {
    var headers = authHeader();
    var formData = new FormData();
    for (var file of files) {
        formData.append(`files.${file.name}`, file.file, file.fileName);
    }
    formData.append("data", JSON.stringify(data));

    const requestOptions: RequestInit = {
        method: "POST",
        headers: headers,
        body: formData,
    };
    const response = await fetch(`${SERVER_URL}/api/${path}`, requestOptions);
    return handleResponse(response);
}

async function _deleteEntity(id: number, path: string) {
    var headers = authHeader();
    const requestOptions: RequestInit = {
        method: "DELETE",
        headers: headers,
    };
    const response = await fetch(`${SERVER_URL}/api/${path}/${id}`, requestOptions);
    return handleResponse(response);
}
