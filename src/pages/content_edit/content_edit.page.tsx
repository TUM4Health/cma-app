import { FC, ReactElement } from "react";
import { useParams } from "react-router-dom";
import ContentEditManager from '../../components/content/ContentEditManager';
import ApplicationShell from '../../components/shell/ApplicationShell';
import content from "../../content/content";
import { Container } from '@mui/material';


const ContentEditPage: FC<any> = (): ReactElement => {
    let params = useParams();
    const data = content[params.entityId!];
    const objectId = parseInt(params.id!);

    return (
        <ApplicationShell
            title={`TUM4Health | ${data.title}`}
        >
            <Container>
                <ContentEditManager
                    objectId={objectId}
                    entityId={params.entityId!}
                />
            </Container>
        </ApplicationShell>
    );
};

export default ContentEditPage;