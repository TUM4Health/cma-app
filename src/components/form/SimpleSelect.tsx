import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, SxProps } from "@mui/material";
import { useField } from "formik";

export interface Props {
    id: string,
    label: string,
    value: any,
    onChange?: ((event: SelectChangeEvent<any>, child: React.ReactNode) => void),
    options: DropDownOption[],
    disabled?: boolean,
    formikMode?: boolean,
}

export interface DropDownOption {
    label: string,
    value: any,
}

export default function SimpleSelect({ id, label, value, onChange, options, disabled, formikMode }: React.PropsWithChildren<Props>) {
    const [field, meta, { setValue, setTouched }] = useField(id);

    return <FormControl fullWidth>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
            disabled={disabled}
            labelId={`${id}-label`}
            id={id}
            value={formikMode ? field.value : value}
            label={label}
            onChange={formikMode ? (event) => setValue(event.target.value) : onChange}
        >
            {
                options.map((entry) =>
                    (<MenuItem key={entry.value} value={entry.value}>{entry.label}</MenuItem>)
                )
            }
        </Select>
    </FormControl>;
}