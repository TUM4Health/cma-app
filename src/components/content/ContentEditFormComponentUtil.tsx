import { Alert, Box, TextField } from "@mui/material";
import { ChangeEventHandler, ReactElement } from "react";
import { EntityField } from "../../content/content";
import RichEditor from "../editor/RichEditor";
import FileUploadField from "../form/FileUploadField";
import FormDateField from "../form/FormDateField";
import FormDateTimeField from "../form/FormDateTimeField";
import RefSelectorField from "../form/RefSelectorField";
import SimpleSelect from "../form/SimpleSelect";

function capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

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
    if (field.type === "password") {
        return <TextField
            sx={{ my: 1 }}
            disabled={!field.editable
            }
            key={field.key}
            fullWidth
            label={field.name} variant="outlined"
            type="password"
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
    if (field.type === "datetime") {
        return <FormDateTimeField
            key={field.key}
            name={field.key}
            helperText={""}
            required={field.required}
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
    if (field.type === "boolean") {
        return <Box sx={{ my: 1 }}>
            <SimpleSelect
                formikMode
                id={field.key}
                label={field.name}
                value={values != null ? values[field.key] : ""}
                options={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
        </Box>;
    }
    if (field.type.match('enum:.*')) {
        const options = field.type.split(":")[1].split(";");
        return <Box sx={{ my: 1 }}>
            <SimpleSelect
                formikMode
                id={field.key}
                label={field.name}
                value={values != null ? values[field.key] : ""}
                options={options.map((o) => ({ label: capitalizeFirstLetter(o), value: o }))} />
        </Box>;
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
    return <Alert severity='error' sx={{ my: 1 }}> Invalid Type: '{field.type}'!</Alert>
}