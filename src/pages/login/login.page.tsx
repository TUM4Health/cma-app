import { LoadingButton } from "@mui/lab";
import { Alert, Card, CardActions, CardContent, Container, Divider, TextField, Typography } from "@mui/material";
import { Formik } from "formik";
import { FC, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { authenticationService } from '../../services/authentication.service';

const LoginPage: FC<any> = (): ReactElement => {
    const navigate = useNavigate();
    return (
        <Container>
            <Card variant="outlined" sx={{ ml: "auto", mr: "auto", mt: "45%", width: { xs: "90%", md: "30%" } }}>
                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={(values, { setSubmitting, setFieldError }) => {
                        authenticationService.login(values.email, values.password).then((response) => {
                            navigate("/", { replace: true });
                            setSubmitting(false);
                        }).catch((err) => {
                            setFieldError('password', "Invalid E-Mail or Password!");
                            setSubmitting(false);
                        });
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting,
                        /* and other goodies */
                    }) => (
                        <form onSubmit={handleSubmit}>
                            <CardContent>
                                <Typography variant="h5">
                                    TUM4Health | Login
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <TextField
                                    sx={{ my: 1 }}
                                    fullWidth
                                    label="E-Mail" variant="outlined"
                                    type="email"
                                    name="email"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.email}
                                />
                                {errors.email && touched.email && <Alert severity="error">{errors.email}</Alert>}
                                <TextField
                                    sx={{ my: 1 }}
                                    fullWidth
                                    label="Password" variant="outlined"
                                    type="password"
                                    name="password"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.password}
                                />
                                {errors.password && touched.password && <Alert severity="error">{errors.password}</Alert>}
                            </CardContent>
                            <CardActions sx={{ justifyContent: "end" }}>
                                <LoadingButton type="submit" loading={isSubmitting}>
                                    Login
                                </LoadingButton>
                            </CardActions>
                        </form>
                    )}
                </Formik>
            </Card>
        </Container >
    );
};

export default LoginPage;