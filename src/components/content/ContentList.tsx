import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { EntityField } from "./ContentManager";
import { contentService } from '../../services/content.service';


interface Props {
    entityName: string,
    entityId: string,
    entityFields: EntityField[],
    hiddenFields: string[]
}

export default function ContentList(props: React.PropsWithChildren<Props>) {
    const [content, setContent] = useState([]);

    const columns = props.entityFields
        .filter((entityField) => !props.hiddenFields.includes(entityField.key))
        .map((entityfield) => ({ field: entityfield.key, headerName: entityfield.name, type: entityfield.type, width: 160 }));

    useEffect(() => {
        contentService.use(props.entityId).getAll().then((response) => {
            setContent(response.data.map((item: any) => ({
                id: item.id,
                ...item.attributes
            })));
        });
    }, [props.entityId]);

    return <><div style={{ height: 400, width: '100%' }}>
        <DataGrid
            rows={content}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            checkboxSelection
        />
    </div></>
}