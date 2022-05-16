import { CircularProgress, Stack, TextField, Typography } from '@mui/material';
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
            name={field.name}
            helperText={""}
            label={field.name} />;
    }
    if (field.type === "image") {
        return <FileUploadField
            key={field.key}
            name={field.name}
            helperText={""}
            label={field.name}
        />;
    }
    return <p>Invalid Type: {field.type}!</p>
}

export default function ContentEditManager(props: React.PropsWithChildren<Props>) {
    const data = content[props.entityId!];
    const [obj, setObj] = useState({} as any);

    useEffect(() => {
        contentService.use(props.entityId).getSingle(props.objectId).then((response) => {
            setObj(response);
        });
    }, [props]);

    console.log(obj);


    return <>
        <Typography variant="h4" component="h1" >
            {props.objectId === -1 ? "Create" : "Edit"}
            {` ${props.entityName}`}
        </Typography>
        {Object.keys(obj).length > 0 && <Formik
            enableReinitialize
            initialValues={{ 'id': obj.data.id, ...obj.data.attributes }}
            onSubmit={(values, { setSubmitting, setFieldError }) => {

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
                <form onSubmit={handleSubmit}>
                    <Stack>
                        {data.entityFields
                            .filter((field) => field.viewable ?? true)
                            .map((field) => getFormComponent(values, field, handleChange, handleBlur))
                        }
                    </Stack>
                </form>
            )}
        </Formik>}
        {Object.keys(obj).length === 0 && <CircularProgress />}
    </>
}