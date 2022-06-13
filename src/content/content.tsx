import { ReactElement } from 'react';
import { Newspaper, MedicalInformation, Coronavirus, MedicalServices, LocationCity, RoomService, People } from '@mui/icons-material';

export interface ContentConfiguration {
    title: string,
    pluralTitle?: string,
    entityFields: EntityField[],
    hideFromPreview?: string[],
    icon: ReactElement,
    apiId: string,
    getData: GetDataFunction,
    putData: PutDataFunction,
    getAttributes: GetAttributesFunction
}

type GetAttributesFunction = (a: any) => any;
type GetDataFunction = (a: any) => any[] | any;
type PutDataFunction = (a: any) => any[] | any;

export interface EntityField {
    name: string,
    key: string,
    type: string,
    multiple?: boolean,
    editable?: boolean,
    viewable?: boolean,
    localizable?: boolean,
}

export const defaultLocale = { key: "en", label: "English", };
export const contentLocales = [defaultLocale, { key: "de", label: "German" }, { key: "fr", label: "French" }];

const content: { [key: string]: ContentConfiguration } = {
    "users": {
        title: "User",
        pluralTitle: "Users",
        apiId: "user",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Username", key: "username", type: "string", editable: true },
            { name: "E-Mail", key: "email", type: "string", editable: true },
            { name: "Password", key: "password", type: "password", editable: true },
            { name: "Confirmed", key: "confirmed", type: "boolean", editable: true },
            { name: "Blocked", key: "blocked", type: "boolean", editable: true },
        ],
        hideFromPreview: ["id", "password"],
        icon: <People />,
        getData: (a) => a,
        getAttributes: (a) => a,
        putData: (a) => a,
    },
    "news-articles": {
        title: "Article",
        pluralTitle: "Articles",
        apiId: "news-article",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Headline", key: "headline", type: "string", editable: true, localizable: true },
            { name: "Subheadline", key: "subheadline", type: "string", editable: true, localizable: true },
            { name: "Description", key: "description", type: "string", editable: true, localizable: true },
            { name: "Date", key: "date", type: "date", editable: true, localizable: true },
            { name: "Article Text", key: "articleText", type: "richtext", editable: true, localizable: true },
            { name: "Title-Image", key: "titleImage", type: "image", editable: true, localizable: true },
            { name: "Article-Media", key: "articleMedia", type: "image", multiple: true, editable: true, localizable: true },
            { name: "Tags", key: "tags", type: "string", editable: true, localizable: true },
        ],
        hideFromPreview: ["id", "articleText", "subheadline", "titleImage", "articleMedia"],
        icon: <Newspaper />,
        getData: (a) => a.data,
        getAttributes: (a) => a.attributes,
        putData: (a) => ({ data: a }),
    },
    "mental-healthcares": {
        title: "Mental Healthcare",
        apiId: "mental-healthcare",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Headline", key: "headline", type: "string", editable: true, localizable: true },
            { name: "Subhead", key: "subhead", type: "string", editable: true, localizable: true },
            { name: "Description", key: "description", type: "string", editable: true, localizable: true },
            { name: "Content", key: "content", type: "richtext", editable: true, localizable: true },
        ],
        hideFromPreview: ["id", "content"],
        icon: <MedicalInformation />,
        getData: (a) => a.data,
        getAttributes: (a) => a.attributes,
        putData: (a) => ({ data: a }),
    },
    "covids": {
        title: "Covid",
        apiId: "covid",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Description", key: "description", type: "string", editable: true, localizable: true }
        ],
        hideFromPreview: ["id"],
        icon: <Coronavirus />,
        getData: (a) => a.data,
        getAttributes: (a) => a.attributes,
        putData: (a) => ({ data: a }),
    },
    "doctors": {
        title: "Doctor",
        apiId: "doctor",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Location", key: "location", type: "ref:locations:title", editable: true, localizable: true },
            { name: "Name", key: "name", type: "string", editable: true, localizable: true },
            { name: "Phone Number", key: "phoneNumber", type: "string", editable: true, localizable: true },
            { name: "Room", key: "room", type: "string", editable: true, localizable: true },
            { name: "Mail", key: "mail", type: "string", editable: true, localizable: true },
            { name: "Specialty", key: "specialty", type: "string", editable: true, localizable: true },
            { name: "Picture", key: "picture", type: "image", editable: true, localizable: true },
        ],
        hideFromPreview: ["id", "location", "picture"],
        icon: <MedicalServices />,
        getData: (a) => a.data,
        getAttributes: (a) => a.attributes,
        putData: (a) => ({ data: a }),
    },
    "locations": {
        title: "Location",
        apiId: "location",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Title", key: "title", type: "string", editable: true, localizable: true },
            { name: "Description", key: "description", type: "string", editable: true, localizable: true },
            { name: "Icon", key: "icon", type: "image", editable: true, localizable: true },
            { name: "Content", key: "content", type: "richtext", editable: true, localizable: true },
        ],
        hideFromPreview: ["id", "content"],
        icon: <LocationCity />,
        getData: (a) => a.data,
        getAttributes: (a) => a.attributes,
        putData: (a) => ({ data: a }),
    },
    "offerings": {
        title: "Offering",
        apiId: "offerings",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false, editable: true },
            { name: "Type", key: "type", type: "string", editable: true, localizable: true },
            { name: "Description", key: "description", type: "string", editable: true, localizable: true },
            { name: "Offering Type", key: "offeringType", type: "enum", editable: true },
            { name: "Icon", key: "icon", type: "image", editable: true, localizable: true },
        ],
        hideFromPreview: ["id"],
        icon: <RoomService />,
        getData: (a) => a.data,
        getAttributes: (a) => a.attributes,
        putData: (a) => ({ data: a }),
    }
};

type NavigationStructure = { [key: string]: string[] };

export const navigationStructure: NavigationStructure = {
    "Administration": ["users"],
    "Content": ["news-articles",
        "mental-healthcares",
        "covids",
        "doctors",
        "locations",
        "offerings"]
};

export default content;