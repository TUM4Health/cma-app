import { Add } from "@mui/icons-material";
import { FC, ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentManager from '../../components/content/ContentManager';
import ApplicationShell from '../../components/shell/ApplicationShell';
import content from "../../content/content";


const ContentPage: FC<any> = (): ReactElement => {
    let params = useParams();
    const navigate = useNavigate();
    const config = content[params.entityId!];
    return (
        <ApplicationShell
            title={`TUM4Health | ${config.pluralTitle ?? config.title}`}
            actionItems={[
                {
                    title: `Create new ${config.title}`,
                    icon: <Add />,
                    onClick: () => {
                        navigate(config.editPathGenerator
                            ? config.editPathGenerator(params.entityId!, "new")
                            : `/content/${params.entityId}/edit/new`);
                    }
                }
            ]}
        >
            <ContentManager
                entityId={params.entityId!}
                entityName={config.title}
                entityFields={config.entityFields}
                hideFromPreview={config.hideFromPreview}
            />
        </ApplicationShell>
    );
};

export default ContentPage;