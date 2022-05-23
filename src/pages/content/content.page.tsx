import { Add } from "@mui/icons-material";
import { FC, ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentManager from '../../components/content/ContentManager';
import ApplicationShell from '../../components/shell/ApplicationShell';
import content from "../../content/content";


const ContentPage: FC<any> = (): ReactElement => {
    let params = useParams();
    const navigate = useNavigate();
    const data = content[params.entityId!];
    return (
        <ApplicationShell
            title={`TUM4Health | ${data.pluralTitle ?? data.title}`}
            actionItems={[
                {
                    title: `Create new ${data.title}`,
                    icon: <Add />,
                    onClick: () => {
                        navigate(`/content/${params.entityId!}/edit/new`);
                    }
                }
            ]}
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