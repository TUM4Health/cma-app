import ContentList from "./ContentList";

export interface EntityField {
    name: string,
    key: string,
    type: string,
}

interface Props {
    entityName: string,
    entityId: string,
    entityFields: EntityField[],
    hideFromPreview?: string[]
}

export default function ContentManager(props: React.PropsWithChildren<Props>) {
    return <>
        <ContentList
            entityName={props.entityName}
            entityId={props.entityId}
            entityFields={props.entityFields}
            hideFromPreview={props.hideFromPreview ?? []}
        />
    </>
}