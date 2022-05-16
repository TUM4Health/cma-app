import { CloudUpload } from '@mui/icons-material';
import { Avatar, Button, ImageList, ImageListItem, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import { useField } from 'formik';
import { useState } from 'react';

export type Props = {
    label: string,
    helperText: string,
    name: string,
    multiple?: boolean,
};

function fileToDataURL(file: File) {
    var reader = new FileReader()
    return new Promise(function (resolve, reject) {
        reader.onload = function (event) {
            resolve(event.target!.result)
        }
        reader.readAsDataURL(file)
    })
}

function getAsImageListItem(src: string, key: string) {
    return <ImageListItem key={key}>
        <img
            src={src}
            height={100}
            width={100}
            alt=""
            loading="lazy"
            object-fit="contain"
        />
    </ImageListItem>;
}

export default function FileUploadField({ label, helperText, name, multiple }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [field, meta, { setValue, setTouched }] = useField(name);
    const [imagePreviews, setImagePreviews] = useState([] as string[]);

    return (
        <Stack direction="row" sx={{ mt: 2 }}>
            <Box sx={{ p: 1 }}>
                <ImageList sx={{ width: 300, height: 100 }} cols={3} rowHeight={100} variant="quilted">
                    {!multiple && getAsImageListItem(imagePreviews[0] || field.value, `${name}-image`)}
                    {multiple && imagePreviews.length === 0 && field.value
                        && field.value.map((val: string, i: number) => getAsImageListItem(val || field.value, `${name}-image-${i}`))}
                    {multiple && imagePreviews.length !== 0 && imagePreviews.map((val: string, i: number) => getAsImageListItem(val || field.value, `${name}-image-${i}`))}
                </ImageList>
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
                        multiple={multiple}
                        hidden
                        onChange={async (e) => {
                            if (e.target.files?.length === 0)
                                return;
                            setImagePreviews([]);
                            var filesArray = Array.prototype.slice.call(e.target.files);
                            const fileReader = new FileReader();
                            fileReader.onload = () => {
                                if (fileReader.readyState === 2) {
                                    if (multiple) {
                                        const files = [];
                                        for (var i = 0; i < e.target.files!.length ?? 0; i++) {
                                            files.push(e.target.files![i]);
                                        }
                                        setValue(files);
                                    } else {
                                        setValue(e.target.files![0]);
                                    }
                                    setImagePreviews([...imagePreviews, fileReader.result as string]);
                                }
                            };
                            var dataUrls = await Promise.all(filesArray.map(fileToDataURL));
                            setImagePreviews(dataUrls as string[]);
                            if (multiple) {
                                setValue(filesArray);
                            } else {
                                setValue(filesArray[0]);
                            }
                        }}
                    />
                </Button>
            </Stack>
        </Stack>
    );
}
