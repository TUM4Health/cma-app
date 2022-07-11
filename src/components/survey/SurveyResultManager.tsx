import { CircularProgress, Paper, Typography } from '@mui/material';
import { Box } from "@mui/system";
import { DataGrid, GridCallbackDetails, GridRowParams, MuiEvent } from "@mui/x-data-grid";
import { format } from "date-fns";
import { FC, ReactElement, useEffect, useState } from "react";
import { SURVEY_ENTITY_ID } from "../../pages/survey/survey.page";
import { contentService } from '../../services/content.service';
import SimpleBarChart from './simple-bar-chart';
import { answerTypeToAPIKey, answerTypeToObjectField, SurveyAnswerType } from './SurveyEditManager';

interface Props {
    objectId: number,
}

const SurveyResultManager: FC<any> = (props: Props): ReactElement => {
    const [obj, setObj] = useState({} as any);
    const [objectId] = useState(props.objectId);
    const [answerType, setAnswerType] = useState<SurveyAnswerType>();
    const [resultObject, setResultObject] = useState({} as any);
    const [questionObject, setQuestionObject] = useState({} as any);
    const [clickedRow, setClickedRow] = useState({} as any);
    // Fetch possible existing object
    useEffect(() => {
        const updateContent = () => {
            if (objectId !== -1) {
                contentService.use(SURVEY_ENTITY_ID).getSingle(objectId).then(async (response) => {
                    const answerType = response.data.attributes.type as SurveyAnswerType;
                    const answerAPIKey = answerTypeToAPIKey[answerType];
                    const answerItemId = response.data.attributes[answerTypeToObjectField[answerType]].data.id;
                    const questionObj = (await contentService.use(answerAPIKey).getSingle(answerItemId)).data.attributes;
                    setQuestionObject(questionObj);

                    if (answerType === SurveyAnswerType.SELECT) {
                        // TODO Implement Select response visualization
                    } else if (answerType === SurveyAnswerType.RANGE) {
                        var aggregatedAnswers: { [key: number]: number } = {};
                        for (var index = questionObj.minRange; index <= questionObj.maxRange; index += questionObj.stepsRange) {
                            aggregatedAnswers[index] = 0;
                        }
                        for (const response of questionObj.survey_response_ranges.data) {
                            const answer = response.attributes.response;
                            aggregatedAnswers[answer]++;
                        }
                        setResultObject(aggregatedAnswers);
                    } else if (answerType === SurveyAnswerType.FREE_TEXT) {
                        var answers = { responses: [] as any[] };
                        var responseIndex = 0;
                        questionObj.survey_response_freetexts.data.forEach((response: any) => {
                            const formattedCreatedAt = format(new Date(response.attributes.createdAt), "dd.MM.yyyy HH:mm");
                            answers.responses.push({ id: responseIndex, response: response.attributes.response, createdAt: formattedCreatedAt });
                            responseIndex++;
                        });
                        setResultObject(answers);
                    }

                    setAnswerType(answerType);
                    setObj(response);
                });
            }
        }

        updateContent();
    }, [objectId]);

    const viewReady = obj && obj.data && resultObject && questionObject;
    return (
        <>
            {viewReady &&
                <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="h2">{obj.data.attributes.question}</Typography>
                    {answerType === SurveyAnswerType.RANGE &&
                        (
                            <>
                                {questionObject && <Typography>On a range from {questionObject.minRange} to {questionObject.maxRange} with a step-size of {questionObject.stepsRange}:</Typography>}
                                <Box sx={{ mt: 2 }} >
                                    <SimpleBarChart
                                        id="test"
                                        width="500"
                                        height="350"
                                        xAxisLabels={Object.keys(resultObject)}
                                        data={[{ name: "Answers", data: Object.values(resultObject) }]}
                                    />
                                </Box>
                            </>)
                    }
                    {answerType === SurveyAnswerType.SELECT &&
                        (
                            <>
                                <Box sx={{ mt: 2 }} >
                                    <SimpleBarChart
                                        id="test"
                                        width="500"
                                        height="350"
                                        xAxisLabels={Object.keys(resultObject)}
                                        data={[{ name: "Answers", data: Object.values(resultObject) }]}
                                    />
                                </Box>
                            </>)
                    }
                    {answerType === SurveyAnswerType.FREE_TEXT &&
                        (
                            <>
                                <Box sx={{ mt: 2, height: '500px', width: '100%' }}>
                                    <DataGrid
                                        rows={resultObject.responses}
                                        columns={[
                                            { field: 'id', headerName: 'ID', hide: true },
                                            { field: 'response', headerName: 'Response', flex: 200 },
                                            { field: 'createdAt', headerName: 'Created at', width: 500 }
                                        ]}
                                        onRowClick={(params: GridRowParams, event: MuiEvent<React.MouseEvent>, details: GridCallbackDetails) => {
                                            setClickedRow(params.row);
                                        }}
                                        pageSize={5}
                                        rowsPerPageOptions={[5]}
                                    />
                                </Box>
                                {clickedRow && Object.keys(clickedRow).length > 0 &&
                                    <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                                        <Typography variant="h5">Selected Response</Typography>
                                        <table>
                                            <tr>
                                                <td><Typography fontWeight={"bold"}>Response:</Typography></td>
                                                <td>{clickedRow.response}</td>
                                            </tr>
                                            <tr>
                                                <td><Typography fontWeight={"bold"}>Created at:</Typography></td>
                                                <td>{clickedRow.createdAt}</td>
                                            </tr>
                                        </table>
                                    </Paper>}
                            </>)
                    }
                </Paper>
            }
            {!viewReady &&
                <CircularProgress />}
        </>
    );
};

export default SurveyResultManager;