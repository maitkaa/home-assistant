import {MeasurePoint} from '@prisma/client';
import {db} from '../utils/db.server';

export async function createErrorLog(message: string, measurePoint?: MeasurePoint) {
    return db.errorLog.create({
        data:
            {
                message,
                measurePoint
            },
    });
}