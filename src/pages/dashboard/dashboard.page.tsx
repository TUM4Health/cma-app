import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { FC, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationShell from '../../components/shell/ApplicationShell';
import content from "../../content/content";
import { authenticationService } from "../../services/authentication.service";

const DashboardPage: FC<any> = (): ReactElement => {
    const navigate = useNavigate();
    return (
        <ApplicationShell
            title="TUM4Health | Dashboard"
        >
            <Typography variant="h3">
                {`Welcome ${authenticationService.currentUserValue.user.username}!`}
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="h5">Quick Actions</Typography>
                <Grid container>
                    {
                        Object.keys(content).map((key) => {
                            const item = content[key];
                            return (
                                <Grid item xs={12} md={6} lg={4} key={item.title}>
                                    <Box sx={{ p: 2 }}>
                                        <Paper variant="outlined">
                                            <Box sx={{ p: 2 }}>
                                                <Stack direction={"row"} alignItems={"center"}>
                                                    <Typography variant="h6">{item.pluralTitle ?? item.title}</Typography>
                                                    <Button sx={{ ml: "auto" }} onClick={() => {
                                                        navigate(item.editPathGenerator
                                                            ? item.editPathGenerator(key, "new")
                                                            : `/content/${key}/edit/new`);
                                                    }}>Create</Button>
                                                    <Button sx={{ ml: 2 }} onClick={() => {
                                                        navigate(`/content/${key}`);
                                                    }}>View</Button>
                                                </Stack>
                                            </Box>
                                        </Paper>
                                    </Box>
                                </Grid>
                            );
                        })
                    }
                </Grid>
            </Box>
        </ApplicationShell>
    );
};

export default DashboardPage;