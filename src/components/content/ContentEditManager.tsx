import { Done, Restore } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, Backdrop, Box, Button, CircularProgress, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useEffect, useMemo, useState } from 'react';
import { createSearchParams, useNavigate, useSearchParams } from 'react-router-dom';
import content, { contentLocales, defaultLocale, EntityField } from '../../content/content';
import { contentService } from '../../services/content.service';
import { getImageUrl, getImageUrls } from '../../services/upload.service';
import { getEmptyValueByType } from '../../utils/typeUtil';
import { getItemAsValue } from '../form/RefSelectorField';
import SimpleSelect from '../form/SimpleSelect';
import getFormComponent from './ContentEditFormComponentUtil';
import submitContent from './ContentEditSubmitHandler';

interface Props {
    entityId: string,
    objectId: number,
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
    const data = content[props.entityId!];
    const [obj, setObj] = useState({} as any);
    // If currently a localization of an entry is edited
    const [localizationConfiguration, setLocalizationConfiguration] = useState({} as LocalizationConfiguration);
    const [objectId, setObjectId] = useState(props.objectId);
    const [initialValues, setInitialValues] = useState({});
    const [error, setError] = useState(null as null | string);
    const [success, setSuccess] = useState(null as null | string);
    const [searchParams] = useSearchParams();
    let navigate = useNavigate();

    const referencedId = parseInt(searchParams.get("ref") ?? "") || null;
    const referencedLocale = searchParams.get("refLocale");
    const requestedLocale = searchParams.get("locale");

    const isLocalizationMode = useMemo(() => Object.keys(localizationConfiguration).length !== 0, [localizationConfiguration]);

    const currentLocale = useMemo(() => {
        var currentLocale = obj.data && obj.data.attributes ? obj.data.attributes.locale : defaultLocale.key;
        if (isLocalizationMode) {
            currentLocale = requestedLocale;
        }
        return currentLocale;
    }, [isLocalizationMode, obj.data, requestedLocale]);

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
            });
        } else {
            var newObj = getEmptyObject(data.entityFields);
            if (isLocalizationMode) {
                newObj.locale = requestedLocale;
            }
            setObj(newObj);
        }
    }, [props, data.entityFields, objectId, isLocalizationMode, requestedLocale]);

    // Prefill form and setup formik with initalValues if data is retrieved
    useEffect(() => {
        const initialValues: { [key: string]: any } = {};
        const combinedData = obj.data ? { "id": obj.data.id, ...obj.data.attributes } : {};
        data.entityFields.forEach((field) => {
            if (field.type === "image" && obj.data != null) {
                if (field.multiple) {
                    initialValues[field.key] = getImageUrls(obj.data.attributes[field.key]);
                } else {
                    initialValues[field.key] = getImageUrl(obj.data.attributes[field.key]);
                }
            } else if (field.type.match(/ref:/) && obj.data != null) {
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
    }, [data.entityFields, obj]);


    // Go through existing localizations in the current fetched object and navigate accordingly
    const onLocaleChanged = (val: string) => {
        // First check if the loaded object contains a localized entry for the selected localization
        if (obj.data && obj.data.attributes.localizations && obj.data.attributes.localizations.data) {
            const found = obj.data.attributes.localizations.data.find((entry: any) =>
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
        const originReferenceId = isLocalizationMode ? referencedId : obj.data.id;
        const originReferenceLocale = isLocalizationMode ? referencedLocale : obj.data.attributes.locale;
        // TODO: show warning that data is lost (?)
        setLocalizationConfiguration({ id: originReferenceId, locale: locale });
        setObjectId(-1); // Reset objectId        
        // Create empty object with localizable field (for pushing later)
        const emptyObj = getEmptyObject(data.entityFields.filter((field) => field.localizable));
        emptyObj.locale = locale;
        setObj(emptyObj); // Set empty object with configured locale
        // Retrieve path without id
        const pathWithoutId = window.location.pathname.slice(0, window.location.pathname.lastIndexOf("/"));
        // Replace window url, to allow reloads
        navigate({
            pathname: `${pathWithoutId}/new`,
            search: "?" + createSearchParams({ ref: originReferenceId, refLocale: originReferenceLocale, locale: locale }).toString()
        }, { replace: true });
    }

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
        <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values: any, { setSubmitting, setFieldError }) => {
                const entityId = props.entityId;
                submitContent({
                    values,
                    setSubmitting,
                    setFieldError,
                    data,
                    obj,
                    objectId,
                    setObjectId,
                    entityId,
                    setError,
                    setSuccess,
                    localizationConfiguration
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
                                {` ${data.title}`}
                            </Typography>
                            { /* Check if the object is newly created, if so, do not show localization select */}
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
                            <Button disabled={isSubmitting} variant="contained" type="reset" startIcon={<Restore />} sx={{ ml: 2 }}>
                                Reset
                            </Button>
                            <LoadingButton loading={isSubmitting} variant="contained" type="submit" color="success" startIcon={<Done />} sx={{ ml: 2 }}>
                                Save
                            </LoadingButton>
                        </Toolbar>
                        <Stack>
                            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            {data.entityFields
                                .filter((field) => field.viewable ?? true)
                                .filter((field) => isLocalizationMode ? field.localizable : true)
                                .map((field) => getFormComponent(values, field, handleChange, handleBlur))
                            }
                        </Stack>
                    </form>
                </>
            )}
        </Formik>
        {Object.keys(obj).length === 0 && <CircularProgress />}
    </>
}