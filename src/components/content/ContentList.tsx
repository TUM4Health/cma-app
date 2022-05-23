import { Delete, Edit } from '@mui/icons-material';
import { IconButton, Tooltip, Backdrop, CircularProgress, Avatar, Skeleton } from '@mui/material';
import { DataGrid, GridCellParams, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { contentService } from '../../services/content.service';
import { EntityField } from '../../content/content';
import { getImageUrl } from '../../services/upload.service';
import { log } from 'console';


interface Props {
    entityName: string,
    entityId: string,
    entityFields: EntityField[],
    hideFromPreview: string[]
}

const getActions = (id: number, entityId: string) => (
    <>
        <Tooltip title="Edit">
            <IconButton component={Link} to={`/content/${entityId}/edit/${id}`} >
                <Edit />
            </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
            <IconButton>
                <Delete />
            </IconButton>
        </Tooltip>
    </>
)

function renderCell(type: string) {
    return (params: GridCellParams) => {
        if (type === "image") {
            if ((params.value as any).data != null) {
                return <Avatar src={getImageUrl(params.value)} />;
            } else {
                return <Skeleton variant="circular" animation={false} width={40} height={40} />;
            }
        }
    };
}

export default function ContentList(props: React.PropsWithChildren<Props>) {
    const [content, setContent] = useState(null as any[] | null);
    const [columns, setColumns] = useState([] as GridColDef[]);

    useEffect(() => {
        // First update columns to new model
        const newColumns: GridColDef[] = (props.entityFields
            .filter((entityField) => !props.hideFromPreview.includes(entityField.key))
            .map((entityField) => ({
                field: entityField.key,
                headerName: entityField.name,
                type: entityField.type,
                width: 160,
                renderCell: ["string", "date", "number"].includes(entityField.type) ? null : renderCell(entityField.type)
            } as GridColDef)));

        newColumns.push({
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params: GridValueGetterParams) => getActions(params.row.id, props.entityId)
        });

        setContent(null);
        setColumns(newColumns);

        // Then update content
        contentService.use(props.entityId).getAll().then((response) => {
            setContent(response.data.map((item: any) => ({
                id: item.id,
                ...item.attributes,
            })));
        });
    }, [props]);

    if (columns.length === 0 || content == null) {
        return <Backdrop
            open={true}
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    }

    return <div style={{ height: 400, width: '100%' }}>
        <DataGrid
            rows={content ?? []}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
        />
    </div>
}