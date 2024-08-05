import { remove } from "lodash";

export function removeNull<T>(obj: T): T {
    Object.keys(obj).forEach(key => obj[key] === null && delete obj[key]);
    return obj;
}