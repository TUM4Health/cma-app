import { Done } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Backdrop, Box, CircularProgress, FormControlLabel, FormGroup, Stack, Switch, Toolbar, Tooltip, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import content, { contentLocales, defaultLocale, EntityField } from '../../content/content';
import { contentService } from '../../services/content.service';
import { getImageUrl, getImageUrls } from '../../services/upload.service';
import { getEmptyValueByType } from '../../utils/typeUtil';
import { getItemAsValue } from '../form/RefSelectorField';
import SimpleSelect from '../form/SimpleSelect';
import ApproveDialog from '../util/ApproveDialog';
import getFormComponent from './ContentEditFormComponentUtil';
import submitContent from './ContentEditSubmitHandler';

export type AfterSubmitFunction = (id: number) => any;

interface Props {
    entityId: string,
    objectId: number,
    afterSubmit?: AfterSubmitFunction
}

export interface LocalizationConfiguration {
    id?: number,
    locale?: string
}

function getEmptyObject(entityFields: EntityField[]) {
    var ret: { [key: string]: any } = {};
    for (const entityField of entityFields) {
        if (!entityField.multiple) {
            ret[entityField.key] = getEmptyValueByType(entityField.type);
        } else {
            ret[entityField.key] = [];
        }
    }
    return ret;
}

export default function ContentEditManager(props: React.PropsWithChildren<Props>) {
    const config = content[props.entityId!];
    const [obj, setObj] = useState({} as any);
    // If currently a localization of an entry is edited
    const [localizationConfiguration, setLocalizationConfiguration] = useState({} as LocalizationConfiguration);
    const [objectId, setObjectId] = useState(props.objectId);
    const [initialValues, setInitialValues] = useState({});
    const [error, setError] = useState(null as null | string);
    const [success, setSuccess] = useState(null as null | string);
    const [published, setPublished] = useState(false);
    const [searchParams] = useSearchParams();
    const [approvableAction, setApprovableAction] = useState(null as { onApprove: Function } | null);
    let navigate = useNavigate();

    const referencedId = parseInt(searchParams.get("ref") ?? "") || null;
    const referencedLocale = searchParams.get("refLocale");
    const requestedLocale = searchParams.get("locale");

    const isLocalizationMode = useMemo(() => Object.keys(localizationConfiguration).length !== 0, [localizationConfiguration]);

    const currentLocale = useMemo(() => {
        var currentLocale = (config.getData(obj) && config.getAttributes(config.getData(obj)) && config.getAttributes(config.getData(obj)).locale) ? config.getAttributes(config.getData(obj)).locale : defaultLocale.key;
        if (isLocalizationMode) {
            currentLocale = requestedLocale;
        }
        return currentLocale;
    }, [isLocalizationMode, obj, requestedLocale]);

    // If page was reload, we need to reconfigure the localizationConfiguration
    useEffect(() => {
        if (!isLocalizationMode && referencedId != null && referencedLocale != null && requestedLocale != null) {
            setLocalizationConfiguration({ id: referencedId, locale: requestedLocale });
        } else if (referencedId == null && referencedLocale == null && referencedLocale == null) {
            setLocalizationConfiguration({});
        }
    }, [isLocalizationMode, referencedId, referencedLocale, requestedLocale]);

    // Fetch possible existing object
    useEffect(() => {
        if (objectId !== -1) {
            contentService.use(props.entityId).getSingle(objectId).then((response) => {
                setObj(response);
                if (config.getData(response) != null && config.getAttributes(config.getData(response)) != null)
                    setPublished(config.getAttributes(config.getData(response)).publishedAt != null);
            });
        } else {
            var newObj = getEmptyObject(config.entityFields);
            if (isLocalizationMode) {
                newObj.locale = requestedLocale;
            }
            setObj(newObj);
            setPublished(false);
        }
    }, [props.entityId, config.entityFields, objectId, isLocalizationMode, requestedLocale]);

    // Prefill form and setup formik with initalValues if data is retrieved
    useEffect(() => {
        const initialValues: { [key: string]: any } = {};
        const combinedData = config.getData(obj) ? { "id": config.getData(obj).id, ...config.getAttributes(config.getData(obj)) } : {};
        config.entityFields.forEach((field) => {
            if (field.type === "image" && config.getData(obj) != null) {
                if (field.multiple) {
                    initialValues[field.key] = getImageUrls(config.getAttributes(config.getData(obj))[field.key]);
                } else {
                    initialValues[field.key] = getImageUrl(config.getAttributes(config.getData(obj))[field.key]);
                }
            } else if (field.type.match(/ref:/) && config.getData(obj) != null) {
                // Read the refProperties to set the value to the correct label
                const refProperties = field.type.split(/ref:/)[1];
                // If no properties provided, cancel => error in content file
                if (refProperties.split(":")[1] == null) {
                    return;
                }
                // read the fields to use in the label
                const refFields = refProperties.split(":")[1].split(",");
                // if a value is set
                if (combinedData[field.key]) {
                    // either set multiple or only a single value for the auto complete
                    initialValues[field.key] = field.multiple ?
                        getItemAsValue(combinedData[field.key].data ?? [], refFields) :
                        getItemAsValue([combinedData[field.key].data], refFields)[0];
                } else {
                    // if no value given, set to default value
                    initialValues[field.key] = field.multiple ? [] : null;
                }
            } else {
                initialValues[field.key] = combinedData[field.key] ?? '';
            }
        });
        setInitialValues(initialValues);
    }, [config.entityFields, obj]);

    // Go through existing localizations in the current fetched object and navigate accordingly
    const onLocaleChanged = (val: string) => {
        setApprovableAction({
            onApprove: () => {
                // First check if the loaded object contains a localized entry for the selected localization
                if (config.getData(obj) && config.getAttributes(config.getData(obj)).localizations && config.getAttributes(config.getData(obj)).localizations.data) {
                    const found = config.getAttributes(config.getData(obj)).localizations.data.find((entry: any) =>
                        entry.attributes.locale === val
                    );
                    if (found) {
                        navigateToIdAndDisableLocalization(found.id);
                    } else {
                        setupNewLocalization(val);
                    }
                } else if (val === referencedLocale) { // Returning back to reference (an already existing) entry
                    navigateToIdAndDisableLocalization(referencedId);
                } else { // Creating new localization
                    setupNewLocalization(val);
                }
            }
        });
    }

    const navigateToIdAndDisableLocalization = (targetId: any) => {
        setLocalizationConfiguration({});
        setObjectId(targetId);
        const pathWithoutId = window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/") + 1);
        navigate({
            pathname: pathWithoutId + targetId,
        }, { replace: true });
    }

    // Setup the form to be in localization mode with the required parameters
    const setupNewLocalization = (locale: string) => {
        // To be able to also switch from a new locale to another new locale, we might need to forward the original referenced existing entry
        const originReferenceId = isLocalizationMode ? referencedId : config.getData(obj).id;
        const originReferenceLocale = isLocalizationMode ? referencedLocale : config.getAttributes(config.getData(obj)).locale ?? defaultLocale.key;
        // TODO: show warning that data is lost (?)
        setLocalizationConfiguration({ id: originReferenceId, locale: locale });
        setObjectId(-1); // Reset objectId        
        // Create empty object with localizable field (for pushing later)
        const emptyObj = getEmptyObject(config.entityFields.filter((field) => field.localizable));
        emptyObj.locale = locale;
        setObj(emptyObj); // Set empty object with configured locale
        setPublished(false);
        // Retrieve path without id
        const pathWithoutId = window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/"));
        // Replace window url, to allow reloads
        navigate({
            pathname: `${pathWithoutId}/new`,
            search: "?" + createSearchParams({ ref: originReferenceId, refLocale: originReferenceLocale, locale: locale }).toString()
        }, { replace: true });
    }

    const isLocalizable = useMemo(() =>
        config.entityFields.find((i) => i.localizable)
        , [config.entityFields]);

    // If nothing was loaded yet, show loading overlay
    if (Object.keys(obj).length === 0 || Object.keys(initialValues).length === 0) {
        return <Backdrop
            open={true}
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    }

    return <>
        <ApproveDialog
            key="discard-changes"
            title={`Discard possible changes?`}
            description={
                `This action can not be reversed!`
            }
            approveTitle="Discard"
            cancelTitle='Cancel'
            handleApprove={() => { if (approvableAction) { approvableAction.onApprove(); setApprovableAction(null); } }}
            handleCancel={() => setApprovableAction(null)}
            open={approvableAction != null}
        />
        <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values: any, { setSubmitting, setFieldError }) => {
                const entityId = props.entityId;
                const afterSubmit = props.afterSubmit;
                submitContent({
                    values,
                    setSubmitting,
                    setFieldError,
                    data: config,
                    obj,
                    objectId,
                    setObjectId,
                    entityId,
                    published,
                    setError,
                    setSuccess,
                    afterSubmit,
                    localizationConfiguration,
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
            }) => (
                <>
                    <form onSubmit={handleSubmit}>
                        <Toolbar>
                            <Typography variant="h4" component="h1" sx={{ mb: 2 }} >
                                {objectId === -1 ? ("Create" + (isLocalizationMode ? " localization for " : "")) : "Edit"}
                                {` ${config.title}`}
                            </Typography>
                            { /* Check if the object is newly created, if so, do not show localization select */}
                            {isLocalizable &&
                                <Tooltip arrow placement="left" title={!isLocalizationMode && objectId === -1 ? "You need to create an entry with the default locale before you can add other locales" : "Choose the locale to edit"}>
                                    <Box sx={{ ml: "auto" }}>
                                        <SimpleSelect
                                            id='locale'
                                            label='Locale'
                                            disabled={objectId === -1 && !isLocalizationMode} // Disable localization chooser if creation entry with default locale
                                            value={currentLocale}
                                            onChange={(ev) => onLocaleChanged(ev.target.value)}
                                            options={contentLocales.map((l) => ({ value: l.key, label: l.label }))} />
                                    </Box>
                                </Tooltip>
                            }
                            {config.publishable &&
                                <FormGroup>
                                    <FormControlLabel control={<Switch checked={published} onChange={(e) => { setPublished(!published) }} />} label="Published" sx={{ ml: isLocalizable ? 2 : "auto" }} />
                                </FormGroup>
                            }
                            <LoadingButton loading={isSubmitting} variant="contained" type="submit" color="success" startIcon={<Done />} sx={{ ml: isLocalizable || config.publishable ? 2 : "auto" }} >
                                Save
                            </LoadingButton>
                        </Toolbar>
                        <Stack>
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            {config.entityFields
                                .filter((field) => field.viewable ?? true)
                                .filter((field) => isLocalizationMode ? field.localizable : true)
                                .map((field) => <Stack>
                                    {getFormComponent(values, field, handleChange, handleBlur)}
                                    {errors[field.key] && <Alert sx={{ mb: 2 }} severity="error"> {errors[field.key]?.toString()} </Alert>}
                                </Stack>)
                            }
                        </Stack>
                    </form>
                </>
            )}
        </Formik>
        {Object.keys(obj).length === 0 && <CircularProgress />}
    </>
}