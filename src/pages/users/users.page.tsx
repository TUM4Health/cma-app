import { FC, ReactElement } from "react";
import ApplicationShell from '../../components/shell/ApplicationShell';
import ContentManager from '../../components/content/ContentManager';

const UsersPage: FC<any> = (): ReactElement => {
    return (
        <ApplicationShell
            title="TUM4Health | Users"
        >
            <ContentManager
                entityId="user"
                entityName="Users"
                entityFields={[{ name: "email", key: "email", type: "email" }]}
            />
        </ApplicationShell>
    );
};

export default UsersPage;