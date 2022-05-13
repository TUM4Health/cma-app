import { FC, ReactElement } from "react";
import ApplicationShell from '../../components/shell/ApplicationShell';

const UsersPage: FC<any> = (): ReactElement => {
    return (
        <ApplicationShell
            title="TUM4Health | Users"
        ></ApplicationShell>
    );
};

export default UsersPage;