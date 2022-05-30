import { Done, LocalLaundryService, Restore } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Backdrop, Box, Button, CircularProgress, Stack, Toolbar, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useEffect, useState } from 'react';
import content, { EntityField } from '../../content/content';
import { contentService } from '../../services/content.service';
import { getImageUrl, getImageUrls } from '../../services/upload.service';
import { getEmptyValueByType } from '../../utils/typeUtil';
import { getItemAsValue } from '../form/RefSelectorField';
import SimpleSelect from '../form/SimpleSelect';
import getFormComponent from './ContentEditFormComponentUtil';
import submitContent from './ContentEditSubmitHandler';
import { contentLocales, defaultLocale } from '../../content/content';

interface Props {
    entityId: string,
    objectId: number,
}

function getEmptyObject(entityFields: EntityField[]) {
    var ret: { [key: string]: any } = {};
    for (const entityField of entityFields) {
        if (entityField.multiple) {
            ret[entityField.key] = getEmptyValueByType(entityField.type);
        } else {
            ret[entityField.key] = [];
        }
    }
    return ret;
}

export default function ContentEditManager(props: React.PropsWithChildren<Props>) {
    const data = content[props.entityId!];
    const [obj, setObj] = useState({} as any);
    const [objectId, setObjectId] = useState(props.objectId);
    const [initialValues, setInitialValues] = useState({});
    const [error, setError] = useState(null as null | string);
    const [success, setSuccess] = useState(null as null | string);

    useEffect(() => {
        if (objectId !== -1) {
            contentService.use(props.entityId).getSingle(objectId).then((response) => {
                setObj(response);
            });
        } else {
            setObj(getEmptyObject(data.entityFields));
        }
    }, [props, data.entityFields, objectId]);

    useEffect(() => {
        const initialValues: { [key: string]: any } = {};
        const combinedData = obj.data ? { "id": obj.data.id, ...obj.data.attributes } : {};
        data.entityFields.forEach((field) => {
            if (field.type === "image" && obj.data != null) {
                if (field.multiple) {
                    initialValues[field.key] = getImageUrls(obj.data.attributes[field.key]);
                } else {
                    initialValues[field.key] = getImageUrl(obj.data.attributes[field.key]);
                }
            } else if (field.type.match(/ref:/) && obj.data != null) {
                // Read the refProperties to set the value to the correct label
                const refProperties = field.type.split(/ref:/)[1];
                // If no properties provided, cancel => error in content file
                if (refProperties.split(":")[1] == null) {
                    return;
                }
                // read the fields to use in the label
                const refFields = refProperties.split(":")[1].split(",");
                // if a value is set
                if (combinedData[field.key]) {
                    // either set multiple or only a single value for the auto complete
                    initialValues[field.key] = field.multiple ?
                        getItemAsValue(combinedData[field.key].data ?? [], refFields) :
                        getItemAsValue([combinedData[field.key].data], refFields)[0];
                } else {
                    // if no value given, set to default value
                    initialValues[field.key] = field.multiple ? [] : null;
                }
            } else {
                initialValues[field.key] = combinedData[field.key] ?? '';
            }
        });
        setInitialValues(initialValues);
    }, [data.entityFields, obj]);

    if (Object.keys(obj).length === 0 || Object.keys(initialValues).length === 0) {
        return <Backdrop
            open={true}
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    }

    const onLocaleChanged = (val: string) => {
        console.log("Locale changed to " + val);

        // First check if the loaded object contains a localized entry for the selected localization
        if (obj.data.attributes.localizations && obj.data.attributes.localizations.data) {
            console.log("Searching existing localized entry...");
            console.log(obj.data.attributes.localizations.data);

            const found = obj.data.attributes.localizations.data.find((entry: any) =>
                entry.attributes.locale === val
            );
            console.log("Found!");
            console.log(found);


            if (found) {
                setObjectId(found.id);
                var pathWithoutId = window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1);
                window.history.replaceState(null, "", pathWithoutId + found.id);
            }
        }
    }

    console.log(obj);


    return <>
        <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values: any, { setSubmitting, setFieldError }) => {
                const entityId = props.entityId;
                submitContent({
                    values,
                    setSubmitting,
                    setFieldError,
                    data,
                    obj,
                    objectId,
                    setObjectId,
                    entityId,
                    setError,
                    setSuccess
                });

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
                        <Toolbar>
                            <Typography variant="h4" component="h1" sx={{ mb: 2 }} >
                                {objectId === -1 ? "Create" : "Edit"}
                                {` ${data.title}`}
                            </Typography>
                            { /* Check if the object is newly created, if so, do not show localization select */}
                            {objectId !== -1 && <Box sx={{ ml: "auto" }}>
                                <SimpleSelect
                                    key='locale'
                                    label='Locale'
                                    value={obj.data.attributes ? obj.data.attributes.locale : ({ value: defaultLocale.key, label: defaultLocale.label })}
                                    onChange={(ev) => onLocaleChanged(ev.target.value)}
                                    options={contentLocales.map((l) => ({ value: l.key, label: l.label }))} />
                            </Box>}
                            <Button disabled={isSubmitting} variant="contained" type="reset" startIcon={<Restore />} sx={{ ml: 2 }}>
                                Reset
                            </Button>
                            <LoadingButton loading={isSubmitting} variant="contained" type="submit" color="success" startIcon={<Done />} sx={{ ml: 2 }}>
                                Save
                            </LoadingButton>
                        </Toolbar>
                        <Stack>
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            {data.entityFields
                                .filter((field) => field.viewable ?? true)
                                .map((field) => getFormComponent(values, field, handleChange, handleBlur))
                            }
                        </Stack>
                    </form>
                </>
            )}
        </Formik>
        {Object.keys(obj).length === 0 && <CircularProgress />}
    </>
}