import { ReactElement } from 'react';
import { Newspaper, MedicalInformation, Coronavirus, MedicalServices, LocationCity, RoomService } from '@mui/icons-material';

export interface ContentConfiguration {
    title: string,
    pluralTitle?: string,
    entityFields: EntityField[],
    hideFromPreview?: string[],
    icon: ReactElement,
    apiId: string
}

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
    "news-articles": {
        title: "Article",
        pluralTitle: "Articles",
        apiId: "news-article",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Headline", key: "headline", type: "string", editable: true, localizable: true },
            { name: "Subheadline", key: "subheadline", type: "string", editable: true },
            { name: "Description", key: "description", type: "string", editable: true },
            { name: "Date", key: "date", type: "date", editable: true },
            { name: "Article Text", key: "articleText", type: "richtext", editable: true },
            { name: "Title-Image", key: "titleImage", type: "image", editable: true },
            { name: "Article-Media", key: "articleMedia", type: "image", multiple: true, editable: true },
            { name: "Tags", key: "tags", type: "string", editable: true },
        ],
        hideFromPreview: ["id", "articleText", "subheadline", "titleImage", "articleMedia"],
        icon: <Newspaper />
    },
    "mental-healthcares": {
        title: "Mental Healthcare",
        apiId: "mental-healthcare",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Headline", key: "headline", type: "string", editable: true },
            { name: "Subhead", key: "subhead", type: "string", editable: true },
            { name: "Description", key: "description", type: "string", editable: true },
            { name: "Content", key: "content", type: "richtext", editable: true },
        ],
        hideFromPreview: ["id", "content"],
        icon: <MedicalInformation />
    },
    "covids": {
        title: "Covid",
        apiId: "covid",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Description", key: "description", type: "string", editable: true, localizable: true }
        ],
        hideFromPreview: ["id"],
        icon: <Coronavirus />
    },
    "doctors": {
        title: "Doctor",
        apiId: "doctor",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Location", key: "location", type: "ref:locations:title", editable: true },
            { name: "Name", key: "name", type: "string", editable: true },
            { name: "Phone Number", key: "phoneNumber", type: "string", editable: true },
            { name: "Room", key: "room", type: "string", editable: true },
            { name: "Mail", key: "mail", type: "string", editable: true },
            { name: "Specialty", key: "specialty", type: "string", editable: true },
            { name: "Picture", key: "picture", type: "image", editable: true },
        ],
        hideFromPreview: ["id", "location", "picture"],
        icon: <MedicalServices />
    },
    "locations": {
        title: "Location",
        apiId: "location",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false },
            { name: "Title", key: "title", type: "string", editable: true },
            { name: "Description", key: "description", type: "string", editable: true },
            { name: "Icon", key: "icon", type: "image", editable: true },
            { name: "Content", key: "content", type: "richtext", editable: true },
        ],
        hideFromPreview: ["id", "content"],
        icon: <LocationCity />
    },
    "offerings": {
        title: "Offering",
        apiId: "offerings",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false, editable: true },
            { name: "Type", key: "type", type: "string", editable: true },
            { name: "Description", key: "description", type: "string", editable: true },
            { name: "Offering Type", key: "offeringType", type: "enum", editable: true },
            { name: "Icon", key: "icon", type: "image", editable: true },
        ],
        hideFromPreview: ["id"],
        icon: <RoomService />
    }
};

export default content;