import { FC, ReactElement, useEffect, useState } from "react";
import content from "../../content/content";
import { SURVEY_ENTITY_ID } from "../../pages/survey/survey.page";
import { contentService } from '../../services/content.service';
import SimpleBarChart from './simple-bar-chart';

interface Props {
    objectId: number,
}

const SurveyResultManager: FC<any> = (props: Props): ReactElement => {
    const config = content[SURVEY_ENTITY_ID];
    const [obj, setObj] = useState({} as any);
    const [objectId, setObjectId] = useState(props.objectId);
    const [resultObject, setResultObject] = useState();

    // Fetch possible existing object
    useEffect(() => {
        updateContent();
    }, [objectId]);

    const updateContent = () => {
        var rangeConfig = { minRange: 0, maxRange: 10, stepsRange: 1 };
        var selectConfig = [];
        if (objectId !== -1) {
            contentService.use(SURVEY_ENTITY_ID).getSingle(objectId).then((response) => {
                console.log(response);

                setObj(response);
            });
        }
    }

    return (
        <>
            <SimpleBarChart
                id="test"
                width="500"
                height="350"
                xAxisLabels={["Yes", "No"]}
                data={[{ name: "Students", data: [152, 125] }, { name: "Professors", data: [32, 25] }]}
            >

            </SimpleBarChart>
        </>
    );
};

export default SurveyResultManager;