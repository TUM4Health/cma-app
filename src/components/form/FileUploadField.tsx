import { CloudUpload } from '@mui/icons-material';
import { Avatar, Button, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import { useField } from 'formik';
import { useState } from 'react';

export type Props = {
    label: string,
    helperText: string,
    name: string,
};

export default function FileUploadField({ label, helperText, name }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [field, meta, { setValue, setTouched }] = useField(name);
    const [imagePreview, setImagePreview] = useState('');

    return (
        <Stack direction="row" sx={{ mt: 2 }}>
            <Box sx={{ p: 1 }}>
                <Avatar sx={{ width: 56, height: 56 }} variant="square" src={imagePreview || field.value} />
            </Box>
            <Stack sx={{ p: 1, justifyContent: "center" }} >
                <Button
                    variant='contained'
                    component='label'
                    startIcon={<CloudUpload />}>
                    {`Choose ${label}`}
                    <input
                        name={name}
                        accept='image/*'
                        type='file'
                        hidden
                        onChange={(e) => {
                            const fileReader = new FileReader();
                            fileReader.onload = () => {
                                if (fileReader.readyState === 2) {
                                    setValue(e.target.files![0]);
                                    setImagePreview(fileReader.result as string);
                                }
                            };
                            fileReader.readAsDataURL(e.target.files![0]);
                        }}
                    />
                </Button>
            </Stack>
        </Stack>
    );
}
