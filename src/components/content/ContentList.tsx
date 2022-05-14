import { Delete, Edit } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { contentService } from '../../services/content.service';
import { EntityField } from "./ContentManager";


interface Props {
    entityName: string,
    entityId: string,
    entityFields: EntityField[],
    hideFromPreview: string[]
}

const getActions = (id: number, entityId: string) => (
    <>
        <Tooltip title="Edit">
            <IconButton component={Link} to={`/${entityId}/edit`} >
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

export default function ContentList(props: React.PropsWithChildren<Props>) {
    const [content, setContent] = useState([]);
    const [columns, setColumns] = useState([] as GridColDef[]);

    useEffect(() => {
        // First update columns to new model
        const newColumns: GridColDef[] = (props.entityFields
            .filter((entityField) => !props.hideFromPreview.includes(entityField.key))
            .map((entityfield) => ({ field: entityfield.key, headerName: entityfield.name, type: entityfield.type, width: 160 })));

        newColumns.push({
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params: GridValueGetterParams) => getActions(params.row.id, props.entityId)
        });
        console.log(props);

        console.log(newColumns);

        setColumns(newColumns);

        // Then update content
        contentService.use(props.entityId).getAll().then((response) => {
            setContent(response.data.map((item: any) => ({
                id: item.id,
                ...item.attributes,
            })));
        });
    }, [props]);

    return <div style={{ height: 400, width: '100%' }}>
        <DataGrid
            rows={content}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
        />
    </div>
}