import { Container, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { Formik } from "formik";
import { FC, ReactElement, useEffect, useRef, useState } from "react";
import content from "../../content/content";
import { SURVEY_ENTITY_ID } from "../../pages/survey/survey.page";
import { contentService } from "../../services/content.service";
import ContentEditManager from "../content/ContentEditManager";
import SurveySelectEditor, { SelectOption } from "./SurveySelectEditor";


interface Props {
    objectId: number,
}

export enum SurveyAnswerType {
    FREE_TEXT = "freetext",
    RANGE = "range",
    SELECT = "select"
}

export const answerTypeToAPIKey = {
    freetext: "survey-question-freetexts",
    range: "survey-question-ranges",
    select: "survey-question-selects",
}

export const answerTypeToObjectField = {
    freetext: "survey_question_freetext",
    range: "survey_question_range",
    select: "survey_question_select",
}

const surveySelectChoiceAPIKey = "survey-question-select-choices";

function getAnswerConfiguration(obj: any, type: SurveyAnswerType) {
    if (!obj.data) {
        return null;
    }
    return obj.data.attributes[answerTypeToObjectField[type]].data;
}

const SurveyEditManager: FC<any> = (props: Props): ReactElement => {
    const config = content[SURVEY_ENTITY_ID];
    const [obj, setObj] = useState({} as any);
    const [objectId, setObjectId] = useState(props.objectId);
    const [answerType, setAnswerType] = useState<SurveyAnswerType | null>(null);
    const formikRef = useRef();
    const proposedSurveyId = useRef(-1);
    const [initialValues, setInitialValues] = useState({});
    const [questionObject, setQuestionObject] = useState({} as any);
    const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);

    // Fetch possible existing object
    useEffect(() => {
        updateContent();
    }, [objectId]);

    const updateContent = () => {
        var questionObject = {} as any;
        const idToUse = objectId !== -1 ? objectId : proposedSurveyId.current;
        if (idToUse !== -1) {
            contentService.use(SURVEY_ENTITY_ID).getSingle(idToUse).then((response) => {
                setObj(response);
                const answerType = response.data.attributes.type as SurveyAnswerType;
                setAnswerType(answerType);
                if (answerType === SurveyAnswerType.RANGE) {
                    questionObject = response.data.attributes["survey_question_range"].data.attributes
                    questionObject.id = response.data.attributes["survey_question_range"].data.id;
                    setQuestionObject(questionObject);
                }
                if (answerType === SurveyAnswerType.SELECT) {
                    questionObject = response.data.attributes["survey_question_select"].data.attributes
                    questionObject.id = response.data.attributes["survey_question_select"].data.id;
                    setQuestionObject(questionObject);
                }
                setInitialValues({
                    type: SurveyAnswerType.FREE_TEXT,
                    minRange: questionObject.minRange,
                    maxRange: questionObject.maxRange,
                    stepsRange: questionObject.stepsRange
                });
            });
        }
        setInitialValues({
            type: SurveyAnswerType.FREE_TEXT,
            minRange: questionObject.minRange,
            maxRange: questionObject.maxRange,
            stepsRange: questionObject.stepsRange
        });
    }

    const onSubmit = (id: number) => {
        (formikRef.current as any).values.survey_id = id;
        (formikRef.current as any).handleSubmit();
        proposedSurveyId.current = id;
    }

    const submitSurveyConfiguration = async (values: any, setSubmitting: (isSubmitting: boolean) => void) => {
        const surveyQuestionId = objectId === -1 ? values.survey_id : objectId;
        const previousType = obj.data ? obj.data.attributes.type as SurveyAnswerType : null;
        const previousConfig = previousType ? getAnswerConfiguration(obj, previousType) : null;
        if (previousType !== answerType) { // Type was changed, delete previous one if exists    
            if (previousConfig && previousType)
                await contentService.use(answerTypeToAPIKey[previousType]).deleteEntity(previousConfig.id);
            // Now create new answer type
            if (answerType === SurveyAnswerType.FREE_TEXT) {
                await contentService.use(answerTypeToAPIKey[answerType]).create(config.putData({ survey_question: surveyQuestionId }));
            }
            if (answerType === SurveyAnswerType.RANGE) {
                await contentService.use(answerTypeToAPIKey[answerType]).create(config.putData({
                    survey_question: surveyQuestionId,
                    minRange: values.minRange,
                    maxRange: values.maxRange,
                    stepsRange: values.stepsRange,
                }));
            }
            if (answerType === SurveyAnswerType.SELECT) {
                const selectOptionIds = [];
                for (const selectOption of selectOptions) {
                    const response = await contentService.use(surveySelectChoiceAPIKey).create(config.putData({
                        choiceText: selectOption.label,
                    }));
                    selectOptionIds.push(response.data.id);
                }
                await contentService.use(answerTypeToAPIKey[answerType]).create(config.putData({
                    survey_question: surveyQuestionId,
                    survey_question_select_choices: selectOptionIds,
                }));
            }
        } else { // Type was not changed
            if (answerType === SurveyAnswerType.RANGE) {
                // Check if a config field was changed
                if (values.minRange !== previousConfig.attributes.minRange
                    || values.maxRange !== previousConfig.attributes.maxRange
                    || values.stepsRange !== previousConfig.attributes.stepsRange) {

                    // Update existing range config with new data
                    await contentService.use(answerTypeToAPIKey[answerType]).update(config.putData({
                        minRange: values.minRange,
                        maxRange: values.maxRange,
                        stepsRange: values.stepsRange,
                    }), previousConfig.id);
                }
            }
            if (answerType === SurveyAnswerType.SELECT) {
                const selectOptionIds = [];
                for (const selectOption of selectOptions) {
                    if (selectOption.deleted) {
                        await contentService.use(surveySelectChoiceAPIKey).deleteEntity(selectOption.id);
                    } else {
                        if (selectOption.id === -1) {
                            // Create new select option
                            const response = await contentService.use(surveySelectChoiceAPIKey).create(config.putData({
                                survey_question: surveyQuestionId,
                                choiceText: selectOption.label,
                            }));
                            selectOptionIds.push(response.data.id);
                        } else if (selectOption.id !== -1 && selectOption.changed) {
                            // Update existing select option
                            const response = await contentService.use(surveySelectChoiceAPIKey).update(config.putData({
                                choiceText: selectOption.label,
                            }), selectOption.id);
                            selectOptionIds.push(response.data.id);
                        } else {
                            // No changes, keep existing select option
                            selectOptionIds.push(selectOption.id);
                        }
                    }
                }
                await contentService.use(answerTypeToAPIKey[answerType]).update(config.putData({
                    survey_question: surveyQuestionId,
                    survey_question_select_choices: selectOptionIds,
                }), previousConfig.id);
            }
        }
        setSubmitting(false);
        updateContent();
    }

    return (
        <>
            <Container>
                <ContentEditManager
                    key={"content-edit"}
                    objectId={props.objectId}
                    entityId={SURVEY_ENTITY_ID}
                    afterSubmit={onSubmit}
                    onChange={(values) => {
                        setAnswerType(values.type as SurveyAnswerType);
                    }}
                />
                <Box sx={{ mt: 2 }} />
                <Formik
                    innerRef={formikRef as any}
                    enableReinitialize
                    initialValues={initialValues}
                    onSubmit={(values: any, { setSubmitting, setFieldError }) => {
                        submitSurveyConfiguration(values, setSubmitting);
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                    }) => (
                        <>
                            <form onSubmit={handleSubmit}>
                                {answerType === SurveyAnswerType.RANGE &&
                                    <Box>
                                        <Stack sx={{ mt: 2 }} direction={"row"}>
                                            <TextField
                                                key={"minRange"}
                                                label={"Min-Range"} variant="outlined"
                                                type="number"
                                                name={"minRange"}
                                                value={values["minRange"]}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <TextField
                                                sx={{ ml: 1 }}
                                                key={"maxRange"}
                                                label={"Max-Range"} variant="outlined"
                                                type="number"
                                                name={"maxRange"}
                                                value={values["maxRange"]}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <TextField
                                                sx={{ ml: 1 }}
                                                key={"stepsRange"}
                                                label={"Range-Steps"} variant="outlined"
                                                type="number"
                                                name={"stepsRange"}
                                                value={values["stepsRange"]}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </Stack>
                                    </Box>
                                }
                                {answerType === SurveyAnswerType.SELECT &&
                                    <Box>
                                        <SurveySelectEditor
                                            id="survey_question_select_editor"
                                            questionObject={questionObject}
                                            onChange={setSelectOptions}
                                        />
                                    </Box>
                                }
                            </form>
                        </>)}
                </Formik>
            </Container>

        </>
    );
};

export default SurveyEditManager;