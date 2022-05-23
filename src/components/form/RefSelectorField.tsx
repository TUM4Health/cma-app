import { Alert, Autocomplete, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import { useField } from "formik";
import { useEffect, useState } from 'react';
import content from '../../content/content';
import { contentService } from '../../services/content.service';

export type Props = {
    label: string,
    helperText: string,
    name: string,
    refKey: string,
    refFields: string[],
    multiple?: boolean,
};

export interface AutocompleteOption {
    label: string,
    id: number
}

export function getItemAsValue(items: any[], refFields: string[]) {
    return items.map((item: any) => ({
        id: item.id,
        label: refFields.map((field) => item.attributes[field]).join(", "),
    } as AutocompleteOption));
}

export default function RefSelectorField({ label, helperText, name, refKey, refFields, multiple, ...props }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [field, meta, { setValue, setTouched }] = useField(name);
    const refContent = content[refKey];
    const [options, setOptions] = useState([] as AutocompleteOption[]);

    useEffect(() => {
        contentService.use(refKey).getAll().then((response) => {
            setOptions(getItemAsValue(response.data, refFields));
        });
    }, [refKey, refFields]);

    if (!refContent) {
        return <Box sx={{ my: 1 }}>
            <Alert severity='error'>
                Can not find content for referenced key: '{refKey}'!
            </Alert>
        </Box>
    }

    return (
        <Box sx={{ my: 1 }}>
            <Autocomplete
                disablePortal
                value={field.value === "" ? (multiple ? [] : null) : field.value}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option: AutocompleteOption) => option.label}
                onChange={(event: any, newValue: AutocompleteOption | AutocompleteOption[] | null) => {
                    setValue(newValue);
                }}
                multiple={multiple}
                options={options}
                defaultValue={options || []}
                renderInput={(params) => <TextField {...params} label={refContent.title} />}
            />
        </Box>
    );
}
