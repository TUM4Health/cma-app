import { DateTimePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { Box, TextField } from "@mui/material";
import deLocale from "date-fns/locale/de";
import { useField } from "formik";
import PropTypes from "prop-types";
import { useState, useEffect } from 'react';

export type Props = {
    label: string,
    helperText: string,
    name: string,
    required?: boolean
};


export default function FormDateTimeField({ label, ...props }: Props) {
    const [field, meta, { setValue, setTouched, setError }] = useField(props);
    useEffect(() => {
        if (field.value === null && props.required) {
            setError(`${label} is required!`);
        }
    }, [field]);

    return (
        <Box sx={{ my: 2 }}>
            <LocalizationProvider locale={deLocale} dateAdapter={AdapterDateFns}>
                <DateTimePicker
                    key={props.name}
                    label={label}
                    inputFormat="dd.MM.yyyy HH:mm"
                    mask="__.__.____ __:__"
                    value={field.value}
                    onChange={(newValue) => {
                        setValue(newValue, false);
                        if (newValue == null) {
                            setError(`${label} is required!`);
                        } else {
                            setError(undefined);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            required={props.required}
                            color={Boolean(meta.error) ? "error" : "primary"}
                            error={Boolean(meta.error)}
                            helperText={meta.error ? meta.error : ""}
                            fullWidth
                            {...params}
                        />
                    )}
                />
            </LocalizationProvider>
        </Box>
    );
}
