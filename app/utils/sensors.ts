import {MeasurePoint} from '@prisma/client';

export const measurePointConfig = {
    [MeasurePoint.BEDROOM]: {
        avatarFallback: 'M',
        name: 'Magamistuba'
    },
    [MeasurePoint.LIVING_ROOM]: {
        avatarFallback: 'E',
        name: 'Elutuba'
    },
    [MeasurePoint.OUTSIDE]: {
        avatarFallback: 'Õ',
        name: 'Õues'
    }
};