import { Done, Restore } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Backdrop, Button, CircularProgress, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { Formik } from 'formik';
import { ChangeEventHandler, ReactElement, useEffect, useState } from 'react';
import content, { EntityField } from '../../content/content';
import { contentService, wrapInData } from '../../services/content.service';
import RichEditor from '../editor/RichEditor';
import FileUploadField from '../form/FileUploadField';
import FormDateField from '../form/FormDateField';
import { getImageUrl, uploadFiles, getImageUrls, deleteFile } from '../../services/upload.service';
import { NamedFile } from '../../services/generic_crud.service';
import { ContentConfiguration } from '../../content/content';

interface Props {
    entityId: string,
    objectId: number,
}

function getFormComponent(values: any, field: EntityField, handleChange: ChangeEventHandler, handleBlur: ChangeEventHandler): ReactElement {
    if (field.type === "string") {
        return <TextField
            sx={{ my: 1 }}
            disabled={!field.editable}
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
    return <p>Invalid Type: {field.type}!</p>
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
    return !obj.find((o) => typeof o != "string");
}

export default function ContentEditManager(props: React.PropsWithChildren<Props>) {
    const data = content[props.entityId!];
    const [obj, setObj] = useState({} as any);
    const [initialValues, setInitialValues] = useState({});

    useEffect(() => {
        contentService.use(props.entityId).getSingle(props.objectId).then((response) => {
            setObj(response);
        });
    }, [props]);

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
            } else {
                initialValues[field.key] = combinedData[field.key] ?? '';
            }
        });
        setInitialValues(initialValues);
    }, [data.entityFields, obj]);

    if (Object.keys(obj).length === 0) {
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
            onSubmit={(values, { setSubmitting, setFieldError }) => {
                const nonFileFields: { [key: string]: any } = {};
                const namedFiles: NamedFile[] = [];
                // First group fields into non file and file fields
                data.entityFields.forEach((field) => {
                    if (field.type === "image" || field.type === "file") {
                        // If (not multiple) value is string => value was not set, so do not add to file uploading
                        // Or (multiple) all values are strings => values were not changed, so do not add to file uploading
                        if ((typeof (values as any)[field.key] != "string" && !field.multiple)
                            || (field.multiple && !isArrayOfStrings((values as any)[field.key]))) {
                            if (!field.multiple) {
                                namedFiles.push({ file: (values as any)[field.key] as File, name: field.key });
                            } else {
                                ((values as any)[field.key] as any[]).forEach(
                                    (iFile: File) => namedFiles.push({ file: iFile, name: field.key })
                                );
                            }
                        } else {
                            // To preserve initial images, the ids need to be readded
                            if (obj.data.attributes[field.key].data)
                                nonFileFields[field.key] = obj.data.attributes[field.key].data.id;
                        }
                    } else {
                        if (field.type === "richtext") {
                            // If richtext, use workaround to retrieve editors value
                            nonFileFields[field.key] = (values as any)[field.key]();
                        } else {
                            nonFileFields[field.key] = (values as any)[field.key];
                        }
                    }
                });

                // Create or Update?
                if (props.objectId === -1) {
                    // Create
                    contentService.use(props.entityId).createWithFiles(nonFileFields, namedFiles)
                        .then((resp) => {
                            console.log("Response");
                            console.log(resp);
                            setSubmitting(false);
                            window.location.reload(); // TODO replace with data reload & set to edit instead of create
                        });
                } else {
                    // Update
                    contentService.use(props.entityId).update(wrapInData(nonFileFields), props.objectId)
                        .then(async (resp) => {
                            const oldImageIds = getImageIds(obj, namedFiles.map((nm) => nm.name), data);
                            // Now upload images & delete old
                            await Promise.all(
                                [...namedFiles.map((namedFile) =>
                                    uploadFiles([namedFile.file],
                                        data.apiId,
                                        props.objectId,
                                        namedFile.name)
                                ),
                                ...oldImageIds.map((id) => deleteFile(id))]
                            )
                            setSubmitting(false);
                        })
                        .catch((error) => {
                            console.error(error);

                            // TODO show error
                            setSubmitting(false);
                        });
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
                /* and other goodies */
            }) => (
                <>
                    <form onSubmit={handleSubmit}>
                        <Toolbar>
                            <Typography variant="h4" component="h1" sx={{ mb: 2 }} >
                                {props.objectId === -1 ? "Create" : "Edit"}
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