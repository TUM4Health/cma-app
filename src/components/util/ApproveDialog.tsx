import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

type Props = {
    open: boolean,
    title: string,
    approveTitle: string,
    cancelTitle: string,
    description: string,
    handleApprove: Function,
    handleCancel: Function,
};

export default function ApproveDialog({
    open,
    title,
    description,
    approveTitle,
    cancelTitle,
    handleApprove,
    handleCancel,
}: Props) {
    return (
        <div>
            <Dialog
                open={open}
                onClose={() => handleCancel()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {description}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCancel()}>{cancelTitle ?? "Cancel"}</Button>
                    <Button onClick={() => handleApprove()} color="error" autoFocus>
                        {approveTitle ?? "Approve"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
