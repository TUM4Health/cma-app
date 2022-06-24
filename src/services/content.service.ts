import { genericCrudService } from './generic_crud.service';

export const contentService = Object.assign(
    {},
    { use: (entityId: string) => genericCrudService(entityId) },
    { useLocalized: (entityId: string, objectId: any) => genericCrudService(`${entityId}/${objectId}/localizations`) }
);

export function wrapInData(data: any) {
    return { "data": data };
}
