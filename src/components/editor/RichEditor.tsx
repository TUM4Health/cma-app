import { Paper } from '@mui/material';
import { convertFromHTML, convertToHTML } from 'draft-convert';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useField } from 'formik';
import { FC, ReactElement, useEffect, useState } from 'react';


export type Props = {
    name: string,
    placeholder?: string,
    value: string
};

const RichEditor: FC<any> = ({ placeholder, name, value }: Props): ReactElement => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [field, meta, { setValue, setTouched }] = useField(name);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    useEffect(() => {
        if (typeof value === "string")
            setEditorState(EditorState.createWithContent(convertFromHTML(value)));
    }, [value]);

    useEffect(() => {
        const html = convertToHTML(editorState.getCurrentContent());
        // Workaround to prevent callback loop
        setValue(() => html);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editorState]);

    const handleKeyCommand = (command: string, editorState: EditorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    return <Paper sx={{ p: 2 }} variant="outlined">
        <Editor
            editorState={editorState}
            placeholder={placeholder}
            onChange={(state) => setEditorState(state)}
            handleKeyCommand={handleKeyCommand}
        />
    </Paper>;
}


export default RichEditor;