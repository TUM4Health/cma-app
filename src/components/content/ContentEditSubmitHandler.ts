import { ContentConfiguration } from '../../content/content';
import { contentService, wrapInData } from '../../services/content.service';
import { NamedFile } from '../../services/generic_crud.service';
import { deleteFile, uploadFiles } from '../../services/upload.service';
import { AutocompleteOption } from '../form/RefSelectorField';
import { LocalizationConfiguration } from './ContentEditManager';

function isArrayOfStrings(obj: any[]) {
    if (typeof obj != "object" || !Array.isArray(obj))
        return false;
    return !obj.find((o) => typeof o != "string");
}

/**
 * This method provides all ids of certain images of an existing entity
 * @param obj the object form what to retrieve the ids
 * @param keys the keys of the images from which to retrieve the ids
 * @param content the content configuration
 * @returns a list of ids of the images
 */
function getImageIds(obj: any, keys: string[], content: ContentConfiguration) {
    const ret: number[] = [];
    content.entityFields.forEach((field) => {
        if (field.type === "image" && keys.includes(field.key)) {
            if (obj.data.attributes[field.key].data == null)
                return;
            if (field.multiple) {
                ret.push(...(obj.data.attributes[field.key].data as any[]).reduce((prev, cur) => [...prev, cur.id], []));
            } else {
                ret.push(obj.data.attributes[field.key].data.id);
            }
        }
    });
    return ret;
}


export interface Props {
    values: any,
    setSubmitting: Function,
    setFieldError: Function,
    data: ContentConfiguration,
    obj: any,
    objectId: number,
    setObjectId: Function,
    entityId: string,
    setError: Function,
    setSuccess: Function,
    localizationConfiguration: LocalizationConfiguration
}

export default function submitContent({ values,
    setSubmitting,
    setFieldError,
    data,
    obj,
    objectId,
    setObjectId,
    entityId,
    setError,
    setSuccess,
    localizationConfiguration }: Props) {
    const nonFileFields: { [key: string]: any } = {};
    const namedFiles: NamedFile[] = [];
    try {
        // First group fields into non file and file fields
        data.entityFields.forEach((field) => {
            if (field.type === "image" || field.type === "file") {
                // If (not multiple) value is string => value was not set, so do not add to file uploading
                // Or (multiple) all values are strings => values were not changed, so do not add to file uploading
                if ((typeof values[field.key] != "string" && !field.multiple)
                    || (field.multiple && !isArrayOfStrings(values[field.key]))) {
                    if (!field.multiple) {
                        namedFiles.push({ file: values[field.key] as File, name: field.key });
                    } else {
                        if ((values[field.key] as any[]))
                            (values[field.key] as any[]).forEach(
                                (iFile: File) => namedFiles.push({ file: iFile, name: field.key })
                            );
                    }
                } else {
                    // To preserve initial images, the ids need to be readded
                    if (obj.data && obj.data.attributes[field.key].data)
                        nonFileFields[field.key] = obj.data.attributes[field.key].data.id;
                }
            } else if (field.type === "richtext" && typeof values[field.key] === "function") {
                // If richtext, use workaround to retrieve editors value
                nonFileFields[field.key] = values[field.key]();
            } else if (field.type.match(/ref:/)) {
                // If reference, retrieve ids to set references                            
                if (field.multiple) {
                    nonFileFields[field.key] = values[field.key].map((item: AutocompleteOption) => item.id);
                } else {
                    nonFileFields[field.key] = values[field.key].id;
                }
            } else {
                nonFileFields[field.key] = values[field.key];
            }
        });

        const isLocalizationMode = Object.keys(localizationConfiguration).length !== 0;
        if (objectId === -1) { // Create
            var service = contentService.use(entityId);
            // Creating localized entry
            if (isLocalizationMode && objectId === -1) {
                service = contentService.useLocalized(entityId, localizationConfiguration.id);
                nonFileFields["locale"] = localizationConfiguration.locale;
            }
            delete nonFileFields.id; // Remove id as is empty anyway
            service.createWithFiles(nonFileFields, namedFiles)
                .then((resp) => {
                    setSubmitting(false);
                    var id = isLocalizationMode ? resp.id : resp.data.id;
                    setObjectId(id);
                    window.history.replaceState(null, "", window.location.pathname.slice(0, -3) + id)
                    setError(null);
                    setSuccess("Entry created!");
                }).catch((error) => {
                    console.error(error);
                    setSubmitting(false);
                    setSuccess(null);
                    setError("An Error has occurred, please try again! (" + error + ")");
                });
        } else {
            // Update
            contentService.use(entityId).update(wrapInData(nonFileFields), objectId)
                .then(async (resp) => {
                    const oldImageIds = getImageIds(obj, namedFiles.map((nm) => nm.name), data);
                    // Now upload images & delete old
                    await Promise.all(
                        [...namedFiles.map((namedFile) =>
                            uploadFiles([namedFile.file],
                                data.apiId,
                                objectId,
                                namedFile.name)
                        ),
                        ...oldImageIds.map((id) => deleteFile(id))]
                    )
                    setSubmitting(false);
                    setError(null);
                    setSuccess("Entry updated!");
                })
                .catch((error) => {
                    console.error(error);
                    setSubmitting(false);
                    setSuccess(null);
                    setError("An Error has occurred, please try again! (" + error + ")");
                });
        }
    } catch (error) {
        console.error(error);
        setSubmitting(false);
        setSuccess(null);
        setError("An Error has occurred, please try again! (" + error + ")");
    }
}