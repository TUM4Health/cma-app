import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import ContentList from "./ContentList";
import ContentListfrom from './ContentList';

export interface EntityField {
    name: string,
    key: string,
    type: string,
}

interface Props {
    entityName: string,
    entityId: string,
    entityFields: EntityField[],
    hiddenFields?: string[]
}

export default function ContentManager(props: React.PropsWithChildren<Props>) {
    return <>
        <ContentList
            entityName={props.entityName}
            entityId={props.entityId}
            entityFields={props.entityFields}
            hiddenFields={props.hiddenFields ?? []}
        />
    </>
}