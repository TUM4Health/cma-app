import { Container, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { Formik, FormikContextType } from "formik";
import { FC, ReactElement, useEffect, useState, useMemo, useRef } from "react";
import content from "../../content/content";
import { SURVEY_ENTITY_ID } from "../../pages/survey/survey.page";
import { contentService } from "../../services/content.service";
import ContentEditManager from "../content/ContentEditManager";
import SimpleSelect from '../form/SimpleSelect';
import ApproveDialog from "../util/ApproveDialog";
import { log } from 'console';


interface Props {
    objectId: number,
}

enum SurveyAnswerType {
    FREE_TEXT = "survey-question-freetexts",
    RANGE = "survey-question-ranges",
    SELECT = "survey-question-selects",
    NONE = "null"
}

function getAnswerType(obj: any) {
    if (obj.data.attributes["survey_question_freetext"].data != null) {
        return SurveyAnswerType.FREE_TEXT;
    } else if (obj.data.attributes["survey_question_range"].data != null) {
        return SurveyAnswerType.RANGE;
    } else if (obj.data.attributes["survey_question_select"].data != null) {
        return SurveyAnswerType.SELECT;
    }
    return SurveyAnswerType.NONE;
}

function getAnswerConfiguration(obj: any, type: SurveyAnswerType) {
    var key = "survey_question_freetext";
    if (type === SurveyAnswerType.RANGE) {
        key = "survey_question_range";
    }
    if (type === SurveyAnswerType.SELECT) {
        key = "survey_question_select";
    }
    return obj.data.attributes[key].data;
}

const SurveyEditManager: FC<any> = (props: Props): ReactElement => {
    const config = content[SURVEY_ENTITY_ID];
    const [approvableAction, setApprovableAction] = useState(null as { onApprove: Function } | null);
    const [obj, setObj] = useState({} as any);
    const [objectId, setObjectId] = useState(props.objectId);
    const [answerType, setAnswerType] = useState(SurveyAnswerType.NONE);
    const formikRef = useRef();
    const [initialValues, setInitialValues] = useState({});
    const [selectConfig, setSelectConfig] = useState({});

    // Fetch possible existing object
    useEffect(() => {
        updateContent();
    }, [objectId]);

    const updateContent = () => {
        var rangeConfig = { minRange: 0, maxRange: 10, stepsRange: 1 };
        var selectConfig = [];
        if (objectId !== -1) {
            contentService.use(SURVEY_ENTITY_ID).getSingle(objectId).then((response) => {
                setObj(response);
                const answerType = getAnswerType(response);
                setAnswerType(answerType);
                if (answerType === SurveyAnswerType.RANGE) {
                    rangeConfig = response.data.attributes["survey_question_range"].data.attributes;
                }
                if (answerType === SurveyAnswerType.SELECT) {
                    setSelectConfig(response.data.attributes["survey_question_select"].data.attributes);
                }
                setInitialValues({
                    type: SurveyAnswerType.FREE_TEXT,
                    minRange: rangeConfig.minRange,
                    maxRange: rangeConfig.maxRange,
                    stepsRange: rangeConfig.stepsRange
                });
            });
        }
        setInitialValues({
            type: SurveyAnswerType.FREE_TEXT,
            minRange: rangeConfig.minRange,
            maxRange: rangeConfig.maxRange,
            stepsRange: rangeConfig.stepsRange
        });
    }

    const onSubmit = () => {
        (formikRef.current as any).handleSubmit();
    }

    const submitSurveyConfiguration = async (values: any, setSubmitting: (isSubmitting: boolean) => void) => {
        console.log(values);
        const previousType = getAnswerType(obj);
        const previousConfig = getAnswerConfiguration(obj, previousType);

        console.log(`Previous: ${previousType} - Now: ${answerType}`);

        if (previousType !== answerType) { // Type was changed, delete previous one if exists    
            if (previousConfig)
                await contentService.use(previousType).deleteEntity(previousConfig.id);
            // Now create new answer type
            if (answerType === SurveyAnswerType.FREE_TEXT) {
                await contentService.use(answerType).create(config.putData({ survey_question: objectId }));
            }
            if (answerType === SurveyAnswerType.RANGE) {
                await contentService.use(answerType).create(config.putData({
                    survey_question: objectId,
                    minRange: values.minRange,
                    maxRange: values.maxRange,
                    stepsRange: values.stepsRange,
                }));
            }
        } else { // Type was not changed
            if (answerType === SurveyAnswerType.RANGE) {
                // Check if a config field was changed
                if (values.minRange !== previousConfig.attributes.minRange
                    || values.maxRange !== previousConfig.attributes.maxRange
                    || values.stepsRange !== previousConfig.attributes.stepsRange) {

                    // Update existing range config with new data
                    await contentService.use(answerType).update(config.putData({
                        minRange: values.minRange,
                        maxRange: values.maxRange,
                        stepsRange: values.stepsRange,
                    }), previousConfig.id);
                }
            }
        }
        setSubmitting(false);
        updateContent();
    }

    return (
        <>
            <ApproveDialog
                key="discard-changes"
                title={`Discard possible changes?`}
                description={
                    `This action can not be reversed!`
                }
                approveTitle="Discard"
                cancelTitle='Cancel'
                handleApprove={() => { if (approvableAction) { approvableAction.onApprove(); setApprovableAction(null); } }}
                handleCancel={() => setApprovableAction(null)}
                open={approvableAction != null}
            />
            <Container>
                <ContentEditManager
                    key={"content-edit"}
                    objectId={props.objectId}
                    entityId={SURVEY_ENTITY_ID}
                    afterSubmit={onSubmit}
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
                                <SimpleSelect
                                    id="type"
                                    label="Answer Type"
                                    options={[
                                        { label: "Free Text", value: SurveyAnswerType.FREE_TEXT },
                                        { label: "Range", value: SurveyAnswerType.RANGE },
                                        { label: "Select", value: SurveyAnswerType.SELECT }
                                    ]}
                                    onChange={(ev) => {
                                        if (answerType === SurveyAnswerType.SELECT) {
                                            setApprovableAction({
                                                onApprove: () => {
                                                    setAnswerType(ev.target.value);
                                                }
                                            });
                                        } else {
                                            setAnswerType(ev.target.value);
                                        }
                                    }}
                                    value={answerType}
                                />

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
                            </form>
                        </>)}
                </Formik>
            </Container>

        </>
    );
};

export default SurveyEditManager;