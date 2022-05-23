export function getEmptyValueByType(type: string): any {
    switch (type) {
        case "image":
            return null;
        case "number":
            return 0;
        case "date":
            return new Date();
        default:
            return "";
    }
}