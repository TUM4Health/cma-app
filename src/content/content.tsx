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
}

const content: { [key: string]: ContentConfiguration } = {
    "news-articles": {
        title: "Article",
        pluralTitle: "Articles",
        apiId: "news-article",
        entityFields: [
            { name: "ID", key: "id", type: "number" },
            { name: "Headline", key: "headline", type: "string", editable: true },
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
            { name: "ID", key: "id", type: "number" },
            { name: "Headline", key: "headline", type: "string" },
            { name: "Subhead", key: "subhead", type: "string" },
            { name: "Description", key: "description", type: "string" },
            { name: "Content", key: "content", type: "richtext" },
        ],
        hideFromPreview: ["id", "content"],
        icon: <MedicalInformation />
    },
    "covids": {
        title: "Covid",
        apiId: "covid",
        entityFields: [
            { name: "ID", key: "id", type: "number" },
            { name: "Description", key: "description", type: "string" }
        ],
        hideFromPreview: ["id"],
        icon: <Coronavirus />
    },
    "doctors": {
        title: "Doctor",
        apiId: "doctor",
        entityFields: [
            { name: "ID", key: "id", type: "number" },
            { name: "Location", key: "location", type: "ref:location" },
            { name: "Name", key: "name", type: "string" },
            { name: "Phone Number", key: "phoneNumber", type: "string" },
            { name: "Room", key: "room", type: "string" },
            { name: "Mail", key: "mail", type: "string" },
            { name: "Specialty", key: "specialty", type: "string" },
            { name: "Picture", key: "picture", type: "image" },
        ],
        hideFromPreview: ["id", "picture"],
        icon: <MedicalServices />
    },
    "locations": {
        title: "Location",
        apiId: "location",
        entityFields: [
            { name: "ID", key: "id", type: "number" },
            { name: "Title", key: "title", type: "string" },
            { name: "Description", key: "description", type: "string" },
            { name: "Icon", key: "icon", type: "image" },
            { name: "Content", key: "content", type: "richtext" },
        ],
        hideFromPreview: ["id", "content"],
        icon: <LocationCity />
    },
    "offerings": {
        title: "Offering",
        apiId: "offerings",
        entityFields: [
            { name: "ID", key: "id", type: "number" },
            { name: "Type", key: "type", type: "string" },
            { name: "Description", key: "description", type: "string" },
            { name: "Offering Type", key: "offeringType", type: "enum" },
            { name: "Icon", key: "icon", type: "image" },
        ],
        hideFromPreview: ["id"],
        icon: <RoomService />
    }
};

export default content;