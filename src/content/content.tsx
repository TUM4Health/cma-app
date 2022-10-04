import { ReactElement } from 'react';
import { Newspaper, MedicalInformation, Coronavirus, MedicalServices, LocationCity, RoomService, People, QuestionAnswer, PieChart, Event } from '@mui/icons-material';
import {
    IconButton,
} from "@mui/material";
import { Link } from 'react-router-dom';
export interface ContentConfiguration {
    title: string,
    pluralTitle?: string,
    entityFields: EntityField[],
    hideFromPreview?: string[],
    icon: ReactElement,
    apiId: string,
    publishable: boolean,
    customActions?: CustomAction[],
    getData: GetDataFunction,
    putData: PutDataFunction,
    getAttributes: GetAttributesFunction,
    editPathGenerator?: CustomEditPathGenerator
}

export interface CustomAction {
    buttonGenerator: CustomActionButtonGenerator,
    tooltipTile: string
}

type GetAttributesFunction = (a: any) => any;
type GetDataFunction = (a: any) => any[] | any;
type PutDataFunction = (a: any) => any[] | any;
type CustomEditPathGenerator = (entityId: string, objectId: string | number) => string;
type CustomActionButtonGenerator = (entitiyId: string, objectId: string | number) => ReactElement;

export interface EntityField {
    name: string,
    key: string,
    type: string,
    multiple?: boolean,
    editable?: boolean,
    viewable?: boolean,
    localizable?: boolean,
    required?: boolean,
}

export const defaultLocale = { key: "en", label: "English", };
export const contentLocales = [defaultLocale, { key: "de", label: "German" }];

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
        publishable: false,
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
        hideFromPreview: ["id", "articleText", "description", "titleImage", "articleMedia"],
        icon: <Newspaper />,
        publishable: true,
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
        publishable: true,
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
        publishable: true,
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
        publishable: true,
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
        publishable: true,
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
        publishable: true,
        getData: (a) => a.data,
        getAttributes: (a) => a.attributes,
        putData: (a) => ({ data: a }),
    },
    "calendar-events": {
        title: "Calendar-Events",
        apiId: "calendar-events",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false, editable: true },
            { name: "Title", key: "title", type: "string", editable: true, localizable: true },
            { name: "Location", key: "location", type: "string", editable: true, localizable: true },
            { name: "Description", key: "description", type: "richtext", editable: true, localizable: true },
            { name: "Start-Date", key: "startDate", type: "datetime", editable: true, required: true },
            { name: "End-Date", key: "endDate", type: "datetime", editable: true, required: false },
        ],
        hideFromPreview: ["id", "description"],
        icon: <Event />,
        publishable: true,
        getData: (a) => a.data,
        getAttributes: (a) => a.attributes,
        putData: (a) => ({ data: a }),
    },
    "survey-questions": {
        title: "Survey",
        pluralTitle: "Survey",
        apiId: "survey-questions",
        entityFields: [
            { name: "ID", key: "id", type: "number", viewable: false, editable: true },
            { name: "Question", key: "question", type: "string", editable: true, localizable: false },
            { name: "Type", key: "type", type: "enum:freetext;range;select", editable: true, localizable: false },
        ],
        hideFromPreview: ["id"],
        icon: <QuestionAnswer />,
        publishable: true,
        editPathGenerator: (entityId, id) => { return `/survey/${id}`; },
        getData: (a) => a.data,
        getAttributes: (a) => a.attributes,
        putData: (a) => ({ data: a }),
        customActions: [
            {
                tooltipTile: "Show Survey Results",
                buttonGenerator: (entityId, objectId) => (
                    <IconButton
                        component={Link}
                        to={
                            `/survey/${objectId}/results`
                        }
                    >
                        <PieChart />
                    </IconButton>
                )
            }
        ]
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
        "offerings",
        "calendar-events",],
    "Interactive": [
        "survey-questions"]
};

export default content;