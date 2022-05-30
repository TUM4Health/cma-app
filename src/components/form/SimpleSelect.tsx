import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";

export interface Props {
    id: string,
    label: string,
    value: any,
    onChange: ((event: SelectChangeEvent<any>, child: React.ReactNode) => void),
    options: DropDownOption[],
    disabled: boolean,
}

export interface DropDownOption {
    label: string,
    value: any,
}

export default function SimpleSelect({ id, label, value, onChange, options, disabled }: React.PropsWithChildren<Props>) {

    return <FormControl fullWidth>
        <InputLabel id={`${id}-label`}>{label}</InputLabel>
        <Select
            disabled={disabled}
            labelId={`${id}-label`}
            id={id}
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