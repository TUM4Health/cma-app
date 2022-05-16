import AdapterDateFns from "@mui/lab/AdapterDateFns";
import DatePicker from "@mui/lab/DatePicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { TextField } from "@mui/material";
import deLocale from "date-fns/locale/de";
import { useField } from "formik";
import Box from '@mui/material/Box';

export type Props = {
    label: string,
    helperText: string,
    name: string
};

export default function FormDateField({ label, helperText, name, ...props }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [field, meta, { setValue, setTouched }] = useField(name);

    return (
        <Box sx={{ my: 2 }}>
            <LocalizationProvider locale={deLocale} dateAdapter={AdapterDateFns}>
                <DatePicker
                    label={label}
                    mask="__.__.____"
                    value={field.value}
                    onChange={(newValue) => {
                        setValue(newValue);
                    }}
                    renderInput={(params) => (
                        <TextField fullWidth {...params} helperText={helperText} />
                    )}
                />
            </LocalizationProvider>
        </Box>
    );
}
