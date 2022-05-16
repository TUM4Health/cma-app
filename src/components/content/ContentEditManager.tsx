import { Done, Restore } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Backdrop, Button, CircularProgress, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { Formik } from 'formik';
import { ChangeEventHandler, ReactElement, useEffect, useState } from 'react';
import content, { EntityField } from '../../content/content';
import { contentService } from '../../services/content.service';
import RichEditor from '../editor/RichEditor';
import FileUploadField from '../form/FileUploadField';
import FormDateField from '../form/FormDateField';

interface Props {
    entityName: string,
    entityId: string,
    objectId: number,
    entityFields: EntityField[],
    hideFromPreview?: string[]
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
        return <RichEditor placeholder={field.name} />
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
            label={field.name}
        />;
    }
    return <p>Invalid Type: {field.type}!</p>
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
        data.entityFields.forEach((field) => {
            initialValues[field.key] = obj.data ? obj.data.attributes[field.key] ?? '' : '';
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
                console.log("Submitting...");
                console.log(values);
                // TODO: replace
                setTimeout(() => {
                    setSubmitting(false);
                }, 2000);
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
                                {` ${props.entityName}`}
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