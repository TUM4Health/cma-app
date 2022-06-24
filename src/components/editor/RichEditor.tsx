import { Editor } from '@tinymce/tinymce-react';
import { useField } from 'formik';
import { FC, ReactElement, useRef } from 'react';

export type Props = {
    name: string,
    placeholder?: string,
    value: string
};

const RichEditor: FC<any> = ({ placeholder, name, value }: Props): ReactElement => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [field, meta, { setValue, setTouched }] = useField(name);

    const editorRef = useRef(null as any);

    return <>
        <Editor
            tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
            onInit={(evt, editor) => editorRef.current = editor}
            onEditorChange={(value) => { setValue(() => value) }}
            initialValue={typeof value === "string" ? field.value : null}
        />
    </>;
}


export default RichEditor;