import { Alert, TextField } from "@mui/material";
import { ChangeEventHandler, ReactElement } from "react";
import { EntityField } from "../../content/content";
import RichEditor from "../editor/RichEditor";
import FileUploadField from "../form/FileUploadField";
import FormDateField from "../form/FormDateField";
import RefSelectorField from "../form/RefSelectorField";

export default function getFormComponent(values: any, field: EntityField, handleChange: ChangeEventHandler, handleBlur: ChangeEventHandler): ReactElement {
    if (field.type === "string") {
        return <TextField
            sx={{ my: 1 }}
            disabled={!field.editable
            }
            key={field.key}
            fullWidth
            label={field.name} variant="outlined"
            type="text"
            name={field.key}
            onChange={handleChange}
            onBlur={handleBlur}
            value={values != null ? values[field.key] : ""
            }
        >
        </ TextField>
    }
    if (field.type === "number") {
        return <TextField
            sx={{ my: 1 }}
            disabled={!field.editable
            }
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
            value={values != null ? values[field.key] : ""
            }
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
    return <Alert severity='error' sx={{ my: 1 }}> Invalid Type: {field.type} !</Alert>
}