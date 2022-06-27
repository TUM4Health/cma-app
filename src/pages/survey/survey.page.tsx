import { FC, ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApplicationShell from '../../components/shell/ApplicationShell';
import SimpleBarChart from '../../components/survey/simple-bar-chart';


const SurveyPage: FC<any> = (): ReactElement => {
    return (
        <ApplicationShell
            title={`TUM4Health | Survey`}
        >
            <SimpleBarChart
                id="test"
                width="500"
                height="350"
                xAxisLabels={["Yes", "No"]}
                data={[{ name: "Students", data: [152, 125] }, { name: "Professors", data: [32, 25] }]}
            >

            </SimpleBarChart>
        </ApplicationShell>
    );
};

export default SurveyPage;