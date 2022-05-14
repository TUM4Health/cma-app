import { FC, ReactElement } from "react";
import ApplicationShell from '../../components/shell/ApplicationShell';
import ContentManager, { EntityField } from '../../components/content/ContentManager';

const articleEntityFields: EntityField[] = [
    { name: "id", key: "id", type: "number" },
    { name: "Headline", key: "headline", type: "string" },
    { name: "Date", key: "date", type: "date" },
    { name: "Article Text", key: "articleText", type: "richtext" },
]

const ArticlesPage: FC<any> = (): ReactElement => {
    return (
        <ApplicationShell
            title="TUM4Health | Articles"
        >
            <ContentManager
                entityId="news-articles"
                entityName="News-Articles"
                entityFields={articleEntityFields}
                hideFromPreview={["id", "articleText"]}
            />
        </ApplicationShell>
    );
};

export default ArticlesPage;