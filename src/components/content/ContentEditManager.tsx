import { Done, Restore } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Backdrop, Button, CircularProgress, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { Formik } from 'formik';
import { ChangeEventHandler, ReactElement, useEffect, useState } from 'react';
import content, { ContentConfiguration, EntityField } from '../../content/content';
import { contentService, wrapInData } from '../../services/content.service';
import { NamedFile } from '../../services/generic_crud.service';
import { deleteFile, getImageUrl, getImageUrls, uploadFiles } from '../../services/upload.service';
import { getEmptyValueByType } from '../../utils/typeUtil';
import RichEditor from '../editor/RichEditor';
import FileUploadField from '../form/FileUploadField';
import FormDateField from '../form/FormDateField';
import RefSelectorField, { AutocompleteOption, getItemAsValue } from '../form/RefSelectorField';

interface Props {
    entityId: string,
    objectId: number,
}

function getFormComponent(values: any, field: EntityField, handleChange: ChangeEventHandler, handleBlur: ChangeEventHandler): ReactElement {
    if (field.type === "string") {
        return <TextField
            sx={{ my: 1 }}
            disabled={!field.editable}
            key={field.key}
            fullWidth
            label={field.name} variant="outlined"
            type="text"
            name={field.key}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values != null ? values[field.key] : ""}
        >
        </ TextField>
    }
    if (field.type === "number") {
        return <TextField
            sx={{ my: 1 }}
            disabled={!field.editable}
            key={field.key}
            fullWidth
            label={field.name} variant="outlined"
            type="number"
            name={field.key}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values != null ? values[field.key] : ""}
        >
        </ TextField>
    }
    if (field.type === "richtext") {
        return <RichEditor
            name={field.key}
            key={field.key}
            value={values != null ? values[field.key] : ""}
            placeholder={field.name} />
    }
    if (field.type === "date") {
        return <FormDateField
            key={field.key}
            name={field.key}
            helperText={""}
            label={field.name} />;
    }
    if (field.type === "image") {
        return <FileUploadField
            key={field.key}
            name={field.key}
            helperText={""}
            multiple={field.multiple}
            label={field.name}
        />;
    }
    if (field.type.match('ref:.*')) {
        return <RefSelectorField
            key={field.key}
            name={field.key}
            helperText={""}
            multiple={field.multiple}
            label={field.name}
            fieldType={field.type}
        />
    }
    return <Alert severity='error' sx={{ my: 1 }}>Invalid Type: {field.type}!</Alert>
}

/**
 * This method provides all ids of certain images of an existing entity
 * @param obj the object form what to retrieve the ids
 * @param keys the keys of the images from which to retrieve the ids
 * @param content the content configuration
 * @returns a list of ids of the images
 */
function getImageIds(obj: any, keys: string[], content: ContentConfiguration) {
    const ret: number[] = [];
    content.entityFields.forEach((field) => {
        if (field.type === "image" && keys.includes(field.key)) {
            if (obj.data.attributes[field.key].data == null)
                return;
            if (field.multiple) {
                ret.push(...(obj.data.attributes[field.key].data as any[]).reduce((prev, cur) => [...prev, cur.id], []));
            } else {
                ret.push(obj.data.attributes[field.key].data.id);
            }
        }
    });
    return ret;
}

function isArrayOfStrings(obj: any[]) {
    if (typeof obj != "object" || !Array.isArray(obj))
        return false;
    return !obj.find((o) => typeof o != "string");
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

    console.log("Content Edit Manager rendered!");


    useEffect(() => {
        console.log("Fetch Object called!");

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

    return <>
        <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values: any, { setSubmitting, setFieldError }) => {
                const nonFileFields: { [key: string]: any } = {};
                const namedFiles: NamedFile[] = [];
                try {
                    // First group fields into non file and file fields
                    data.entityFields.forEach((field) => {
                        if (field.type === "image" || field.type === "file") {
                            // If (not multiple) value is string => value was not set, so do not add to file uploading
                            // Or (multiple) all values are strings => values were not changed, so do not add to file uploading
                            if ((typeof values[field.key] != "string" && !field.multiple)
                                || (field.multiple && !isArrayOfStrings(values[field.key]))) {
                                if (!field.multiple) {
                                    namedFiles.push({ file: values[field.key] as File, name: field.key });
                                } else {
                                    if ((values[field.key] as any[]))
                                        (values[field.key] as any[]).forEach(
                                            (iFile: File) => namedFiles.push({ file: iFile, name: field.key })
                                        );
                                }
                            } else {
                                // To preserve initial images, the ids need to be readded
                                if (obj.data && obj.data.attributes[field.key].data)
                                    nonFileFields[field.key] = obj.data.attributes[field.key].data.id;
                            }
                        } else if (field.type === "richtext" && typeof values[field.key] === "function") {
                            // If richtext, use workaround to retrieve editors value
                            nonFileFields[field.key] = values[field.key]();
                        } else if (field.type.match(/ref:/)) {
                            // If reference, retrieve ids to set references                            
                            if (field.multiple) {
                                nonFileFields[field.key] = values[field.key].map((item: AutocompleteOption) => item.id);
                            } else {
                                nonFileFields[field.key] = values[field.key].id;
                            }
                        } else {
                            nonFileFields[field.key] = values[field.key];
                        }
                    });

                    // Create or Update?
                    if (objectId === -1) {
                        // Create
                        delete nonFileFields.id; // Remove id as is empty anyway
                        contentService.use(props.entityId).createWithFiles(nonFileFields, namedFiles)
                            .then((resp) => {
                                setSubmitting(false);
                                var id = resp.data.id;
                                setObjectId(id);
                                window.history.replaceState(null, "", window.location.pathname.slice(0, -3) + id)
                                setError(null);
                                setSuccess("Entry created!");
                            }).catch((error) => {
                                console.error(error);
                                setSubmitting(false);
                                setSuccess(null);
                                setError("An Error has occurred, please try again! (" + error + ")");
                            });
                    } else {
                        // Update
                        contentService.use(props.entityId).update(wrapInData(nonFileFields), objectId)
                            .then(async (resp) => {
                                const oldImageIds = getImageIds(obj, namedFiles.map((nm) => nm.name), data);
                                // Now upload images & delete old
                                await Promise.all(
                                    [...namedFiles.map((namedFile) =>
                                        uploadFiles([namedFile.file],
                                            data.apiId,
                                            objectId,
                                            namedFile.name)
                                    ),
                                    ...oldImageIds.map((id) => deleteFile(id))]
                                )
                                setSubmitting(false);
                                setError(null);
                                setSuccess("Entry updated!");
                            })
                            .catch((error) => {
                                console.error(error);
                                setSubmitting(false);
                                setSuccess(null);
                                setError("An Error has occurred, please try again! (" + error + ")");
                            });
                    }
                } catch (error) {
                    console.error(error);
                    setSubmitting(false);
                    setSuccess(null);
                    setError("An Error has occurred, please try again! (" + error + ")");
                }
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
                            <Button disabled={isSubmitting} variant="contained" type="reset" startIcon={<Restore />} sx={{ ml: "auto" }}>
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