import { DateTime } from "luxon";

export class DateUtils {
    static toDate(date: string): Date | null {
        if (!date) return null;

        const formats = [
            'dd/M/yyyy HH:mm',
            'dd/MM/yyyy HH:mm',
            'dd/M/yyyy',
            'dd/MM/yyyy',
            'yyyy-MM-dd HH:mm:ss',  // SQL format
            'yyyy-MM-dd',           // SQL date only
            'M/d/yyyy',             // US format
            'MM/dd/yyyy',           // US format with leading zeros
            'dd-MM-yyyy',           // with dashes
            'yyyy/MM/dd',           // ISO-like with slashes
        ];

        for (const format of formats) {
            const parsed = DateTime.fromFormat(date, format);
            if (parsed.isValid) {
                return parsed.toJSDate();
            }
        }

        // Try ISO and SQL parsing as fallback
        const isoDate = DateTime.fromISO(date);
        if (isoDate.isValid) {
            return isoDate.toJSDate();
        }

        const sqlDate = DateTime.fromSQL(date);
        if (sqlDate.isValid) {
            return sqlDate.toJSDate();
        }

        return null; // Return null if no format matches
    }
}