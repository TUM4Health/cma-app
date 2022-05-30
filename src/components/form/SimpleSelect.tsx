import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

export interface Props {
    key: string,
    label: string,
    value: any,
    onChange: ((event: SelectChangeEvent<any>, child: React.ReactNode) => void),
    options: DropDownOption[]
}

export interface DropDownOption {
    label: string,
    value: any,
}

export default function SimpleSelect({ key, label, value, onChange, options }: Props) {

    return <FormControl fullWidth>
        <InputLabel id={`${key}-label`}>{label}</InputLabel>
        <Select
            labelId={`${key}-label`}
            id={key}
            value={value}
            label={label}
            onChange={onChange}
        >
            {
                options.map((entry) =>
                    (<MenuItem key={entry.value} value={entry.value}>{entry.label}</MenuItem>)
                )
            }
        </Select>
    </FormControl>;
}