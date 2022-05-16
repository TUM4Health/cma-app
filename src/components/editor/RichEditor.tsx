import { Paper } from '@mui/material';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { FC, ReactElement, useState } from 'react';


export type Props = {
    placeholder?: string,
};

const RichEditor: FC<any> = ({ placeholder }: Props): ReactElement => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

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