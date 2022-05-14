import { EntityField } from "../components/content/ContentManager";
import { ReactElement } from 'react';
import { Newspaper, MedicalInformation } from '@mui/icons-material';

export interface ContentConfiguration {
    title: string,
    entityFields: EntityField[],
    hideFromPreview?: string[],
    icon: ReactElement
}

const articleEntityFields: EntityField[] = [
    { name: "id", key: "id", type: "number" },
    { name: "Headline", key: "headline", type: "string" },
    { name: "Date", key: "date", type: "date" },
    { name: "Article Text", key: "articleText", type: "richtext" },
]

const mentalHealthcareFields: EntityField[] = [
    { name: "id", key: "id", type: "number" },
    { name: "Headline", key: "headline", type: "string" },
    { name: "Subhead", key: "subhead", type: "string" },
    { name: "Description", key: "description", type: "string" },
    { name: "Content", key: "content", type: "richtext" },
]

const content: { [key: string]: ContentConfiguration } = {
    "news-articles": {
        title: "Articles",
        entityFields: articleEntityFields,
        hideFromPreview: ["id", "articleText"],
        icon: <Newspaper />
    },
    "mental-healthcares": {
        title: "Mental Healthcare",
        entityFields: mentalHealthcareFields,
        hideFromPreview: ["id", "content"],
        icon: <MedicalInformation />
    }
};

export default content;