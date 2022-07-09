import { Check, Delete, DoneAll, Edit, Unpublished } from "@mui/icons-material";
import {
    Avatar,
    Backdrop,
    Chip,
    CircularProgress,
    IconButton,
    Skeleton,
    Tooltip,
} from "@mui/material";
import {
    DataGrid,
    GridCellParams,
    GridColDef,
    GridValueGetterParams,
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import content, { EntityField } from "../../content/content";
import { contentService } from "../../services/content.service";
import { getImageUrl } from "../../services/upload.service";
import ApproveDialog from "../util/ApproveDialog";
import { ContentConfiguration } from "../../content/content";

interface Props {
    entityName: string;
    entityId: string;
    entityFields: EntityField[];
    hideFromPreview: string[];
}

const getActions = (
    config: ContentConfiguration,
    id: number,
    entityId: string,
    onDelete: Function
) => (
    <>
        {config.customActions?.map((action, index) => (
            <Tooltip title={action.tooltipTile} key={index}>
                <span>
                    {action.buttonGenerator(entityId, id)}
                </span>
            </Tooltip>
        ))}
        <Tooltip title="Edit">
            <IconButton
                component={Link}
                to={
                    config.editPathGenerator
                        ? config.editPathGenerator(entityId, id)
                        : `/content/${entityId}/edit/${id}`
                }
            >
                <Edit />
            </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
            <IconButton onClick={() => onDelete(id)}>
                <Delete />
            </IconButton>
        </Tooltip>
    </>
);

function renderCell(type: string) {
    return (params: GridCellParams) => {
        if (type === "image") {
            if ((params.value as any).data != null) {
                return <Avatar src={getImageUrl(params.value)} />;
            } else {
                return (
                    <Skeleton
                        variant="circular"
                        animation={false}
                        width={40}
                        height={40}
                    />
                );
            }
        }
    };
}

export default function ContentList(props: React.PropsWithChildren<Props>) {
    const [dataContent, setContent] = useState(null as any[] | null);
    const [columns, setColumns] = useState([] as GridColDef[]);
    const [currentDeleteCandidate, setCurrentDeleteCandidate] = useState(-1);

    const config = content[props.entityId];

    const deleteEntity = (id: number) => {
        contentService
            .use(props.entityId)
            .deleteEntity(id)
            .then(() => {
                // Then update content
                contentService
                    .use(props.entityId)
                    .getAll()
                    .then((response) => {
                        setContent(
                            config.getData(response).map((item: any) => ({
                                id: item.id,
                                ...config.getAttributes(item),
                                state:
                                    config.getAttributes(item).publishedAt == null
                                        ? "Unpublished"
                                        : "Published",
                            }))
                        );
                    });
            });
        setCurrentDeleteCandidate(-1);
    };

    useEffect(() => {
        // First update columns to new model
        const newColumns: GridColDef[] = props.entityFields
            .filter((entityField) => !props.hideFromPreview.includes(entityField.key))
            .map(
                (entityField) =>
                ({
                    field: entityField.key,
                    headerName: entityField.name,
                    type: entityField.type,
                    width: 160,
                    renderCell: ["string", "date", "number"].includes(entityField.type)
                        ? null
                        : renderCell(entityField.type),
                } as GridColDef)
            );

        if (config.publishable)
            newColumns.push({
                field: "state",
                headerName: "State",
                flex: 1,
                renderCell: (params: GridValueGetterParams) => (
                    <Chip
                        label={params.value}
                        color={params.value === "Published" ? "success" : "primary"}
                        icon={params.value === "Published" ? <DoneAll /> : <Unpublished />}
                    />
                ),
            });

        newColumns.push({
            field: "actions",
            headerName: "Actions",
            flex: 1,
            renderCell: (params: GridValueGetterParams) =>
                getActions(config, params.row.id, props.entityId, (id: number) =>
                    setCurrentDeleteCandidate(id)
                ),
        });

        setContent(null);
        setColumns(newColumns);

        // Then update content
        contentService
            .use(props.entityId)
            .getAll()
            .then((response) => {
                setContent(
                    config.getData(response).map((item: any) => ({
                        id: item.id,
                        ...config.getAttributes(item),
                        state:
                            config.getAttributes(item).publishedAt == null
                                ? "Unpublished"
                                : "Published",
                    }))
                );
            })
            .catch((error) => {
                setContent([]); // TODO: add error handling
            });
    }, [props]);

    if (columns.length === 0 || dataContent == null) {
        return (
            <Backdrop
                open={true}
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    return (
        <>
            <ApproveDialog
                key="deleteEntity"
                title={`Delete ${props.entityName}?`}
                description={`This action can not be reversed!`}
                approveTitle="Delete"
                cancelTitle="Cancel"
                handleApprove={() => deleteEntity(currentDeleteCandidate)}
                handleCancel={() => setCurrentDeleteCandidate(-1)}
                open={currentDeleteCandidate !== -1}
            />
            <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                    rows={dataContent ?? []}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                />
            </div>
        </>
    );
}
