import { Add, Delete } from "@mui/icons-material";
import { Button, Grid, Icon, IconButton, List, styled, TextField, Toolbar, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from 'react';
import { contentService } from "../../services/content.service";


export interface Props {
    id: string,
    questionObject: any,
    onChange?: ((options: SelectOption[]) => void),
}

export interface SelectOption {
    id: number,
    label: string
    deleted: boolean,
    changed: boolean,
}

const ToolbarStyle = styled(Toolbar)(({ theme }) => ({
    height: 96,
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(0, 1, 0, 3),
}));

const surveySelectOptionsAPIKey = "survey-question-selects";

export default function SurveySelectEditor({ id, questionObject, onChange }: React.PropsWithChildren<Props>) {
    var initialData: SelectOption[] = [{ id: -1, label: "", deleted: false, changed: true }];
    const [options, setOptions] = useState<SelectOption[]>(initialData ? initialData : []);

    useEffect(() => {
        if (questionObject.id !== undefined) {
            contentService.use(surveySelectOptionsAPIKey).getSingle(questionObject.id).then((item) => {
                const fullObject = { id: item.id, ...item.data.attributes };
                const newOptions = fullObject.survey_question_select_choices.data.map((item: any) => {
                    return { id: item.id, label: item.attributes.choiceText, deleted: false };
                });
                setOptions(newOptions);
                onChange && onChange(newOptions);
            });
        } else {
            onChange && onChange(initialData);
        }
    }, [questionObject.id, onChange]);


    const modifyFieldFromEvent = (item: SelectOption, field: string) => {
        return (event: any) => {
            (item as any)[field] = event.target.value;
            item.changed = true;
            setOptions([...options]);
            onChange && onChange(options);
        };
    };

    return <>
        <ToolbarStyle>
            <Typography variant="subtitle2" color="primary" gutterBottom>
                Define the options for the select
            </Typography>
            <Button
                startIcon={<Add />}
                onClick={async () => {
                    setOptions([
                        ...options,
                        {
                            id: -1,
                            label: '',
                            deleted: false,
                            changed: true,
                        },
                    ]);
                }}
                variant="contained"
                color="primary"
                style={{ marginLeft: "auto" }}
            >
                Add option
            </Button>
        </ToolbarStyle>
        <List>
            {options
                .filter((item) => !item.deleted)
                .map((item, index) => (
                    <Grid
                        key={index}
                        container
                        spacing={2}
                        rowSpacing={2}
                        sx={{ mb: 2 }}
                        alignItems={"center"}
                    >
                        <Grid item xs={11}>
                            <TextField
                                value={item.label}
                                label="Label"
                                onChange={modifyFieldFromEvent(item, "label")}
                                fullWidth
                            ></TextField>
                        </Grid>
                        <Grid item xs={1}>
                            <Tooltip title={"Delete Option"}>
                                <span>
                                    <IconButton
                                        disabled={options.filter((i) => !i.deleted).length === 1}
                                        sx={{ ml: "auto" }}
                                        onClick={() => {
                                            item.deleted = true;
                                            setOptions([...options]);
                                            onChange && onChange(options);
                                        }}
                                    >
                                        <Icon>
                                            <Delete />
                                        </Icon>
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Grid>
                    </Grid>
                ))}
        </List>
    </>;
}