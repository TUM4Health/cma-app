import { FC, ReactElement } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApplicationShell from '../../components/shell/ApplicationShell';
import SimpleBarChart from '../../components/survey/simple-bar-chart';
import SurveyEditManager from "../../components/survey/SurveyEditManager";
import SurveyResultManager from "../../components/survey/SurveyResultManager";
import content from "../../content/content";

export const SURVEY_ENTITY_ID = "survey-questions";
export const SURVEY_FREETEXT_QUESTION_ENTITY_ID = "survey-question-freetexts";
export const SURVEY_RANGE_QUESTION_ENTITY_ID = "survey-question-ranges";
export const SURVEY_SELECT_QUESTION_ENTITY_ID = "survey-question-selects";

const SurveyResultsPage: FC<any> = (): ReactElement => {

    let params = useParams();
    const config = content[SURVEY_ENTITY_ID];
    var objectId = -1;
    if (!isNaN(parseInt(params.id!))) {
        objectId = parseInt(params.id!);
    }

    return (
        <ApplicationShell
            title={`TUM4Health | Survey`}
        >
            <SurveyResultManager
                objectId={objectId}
            />
        </ApplicationShell>
    );
};

export default SurveyResultsPage;