import {db} from '../utils/db.server';
import {MeasurePoint} from '@prisma/client';

export interface MeasurementAverage {
    interval: string;
    average_value: number;
}

export interface TemperatureDifference {
    minTemperatureDifference: number;
    maxTemperatureDifference: number;
}

export async function createMeasurement(value: number, measurePoint: MeasurePoint) {
    return db.measurements.create({
        data: {
            value,
            measurePoint: measurePoint
        }
    });
}

export async function getLastTenMeasurements() {
    return db.measurements.findMany({
        take: 10,
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function getFirstMeasurementByMeasurePoint(measurePoint: MeasurePoint) {
    return db.measurements.findFirst({
        where: {
            measurePoint: measurePoint
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
}

export async function getLowestValueTodayByMeasurePoint(measurePoint: MeasurePoint) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return db.measurements.findFirst({
        where: {
            measurePoint: measurePoint,
            createdAt: {
                gte: today,
                lt: tomorrow
            }
        },
        orderBy: {
            value: 'asc'
        }
    });
}

export async function getHighestValueTodayByMeasurePoint(measurePoint: MeasurePoint) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return db.measurements.findFirst({
        where: {
            measurePoint: measurePoint,
            createdAt: {
                gte: today,
                lt: tomorrow
            }
        },
        orderBy: {
            value: 'desc'
        }
    });
}
/*
export async function getMeasurementsLast24Hours(measurePoint: MeasurePoint) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

    return db.measurements.findMany({
        where: {
            measurePoint: measurePoint,
            createdAt: {
                gte: yesterday,
                lt: now
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
}
*/

export async function getMeasurementsForChart(measurePoint: MeasurePoint): Promise<MeasurementAverage[]> {
    const now = new Date();
    const startOfCurrentDay = new Date();
    startOfCurrentDay.setHours(6, 0, 0, 0);

    // If current time is after 01:00 of the next day, set the end time to 01:00
    const endOfCurrentDay = new Date();
    if (now.getHours() >= 1) {
        endOfCurrentDay.setDate(endOfCurrentDay.getDate() + 1);
        endOfCurrentDay.setHours(1, 0, 0, 0);
    } else {
        endOfCurrentDay.setTime(now.getTime());
    }

    const result = await db.$queryRawUnsafe(`
        SELECT DATE_TRUNC('hour', "createdAt") + INTERVAL '15 minutes' * FLOOR(EXTRACT(MINUTE FROM "createdAt") / 15) as interval, AVG (value) as average_value
        FROM
            "Measurements"
        WHERE
            "measurePoint"::text = $1
          AND "createdAt" >= $2
          AND "createdAt" < $3
        GROUP BY
            interval
        ORDER BY
            interval ASC
    `, measurePoint.toString().toUpperCase(), startOfCurrentDay, endOfCurrentDay);

    return result as MeasurementAverage[];
}

export async function getTemperatureDifference(measurePoint: MeasurePoint): Promise<TemperatureDifference | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayMinMeasurement = await db.measurements.findFirst({
        where: {
            measurePoint: measurePoint,
            createdAt: {
                gte: today
            }
        },
        orderBy: {
            value: 'asc'
        }
    });

    const todayMaxMeasurement = await db.measurements.findFirst({
        where: {
            measurePoint: measurePoint,
            createdAt: {
                gte: today
            }
        },
        orderBy: {
            value: 'desc'
        }
    });

    const yesterdayMinMeasurement = await db.measurements.findFirst({
        where: {
            measurePoint: measurePoint,
            createdAt: {
                gte: yesterday,
                lt: today
            }
        },
        orderBy: {
            value: 'asc'
        }
    });

    const yesterdayMaxMeasurement = await db.measurements.findFirst({
        where: {
            measurePoint: measurePoint,
            createdAt: {
                gte: yesterday,
                lt: today
            }
        },
        orderBy: {
            value: 'desc'
        }
    });

    if (!todayMinMeasurement || !todayMaxMeasurement || !yesterdayMinMeasurement || !yesterdayMaxMeasurement) {
        return undefined;
    }

    const minTemperatureDifference = todayMinMeasurement.value - yesterdayMinMeasurement.value;
    const maxTemperatureDifference = todayMaxMeasurement.value - yesterdayMaxMeasurement.value;

    return { minTemperatureDifference, maxTemperatureDifference };
}