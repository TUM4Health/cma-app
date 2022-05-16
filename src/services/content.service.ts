import { genericCrudService } from './generic_crud.service';

export const contentService = Object.assign(
    {},
    { use: (entityId: string) => genericCrudService(entityId) }
);

export function wrapInData(data: any) {
    return { "data": data };
}
