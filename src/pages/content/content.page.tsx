import { FC, ReactElement } from "react";
import { useParams } from "react-router-dom";
import ContentManager from '../../components/content/ContentManager';
import ApplicationShell from '../../components/shell/ApplicationShell';
import content from "../../content/content";


const ContentPage: FC<any> = (): ReactElement => {
    let params = useParams();
    const data = content[params.entityId!];
    return (
        <ApplicationShell
            title={`TUM4Health | ${data.pluralTitle ?? data.title}`}
        >
            <ContentManager
                entityId={params.entityId!}
                entityName={data.title}
                entityFields={data.entityFields}
                hideFromPreview={data.hideFromPreview}
            />
        </ApplicationShell>
    );
};

export default ContentPage;