import { FC, ReactElement } from "react";
import ApplicationShell from '../../components/shell/ApplicationShell';

const DashboardPage: FC<any> = (): ReactElement => {
    return (
        <ApplicationShell
            title="TUM4Health | Dashboard"
        ></ApplicationShell>
    );
};

export default DashboardPage;