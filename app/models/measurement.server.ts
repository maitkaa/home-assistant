import {db} from '../utils/db.server';
import {MeasurePoint} from '@prisma/client';

export async function createMeasurement(value: number, measurePoint: MeasurePoint) {
    return db.mesurements.create({
        data: {
            value,
            measurePoint: measurePoint
        }
    });
}