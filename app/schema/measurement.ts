import { z } from "zod";
import {MeasurePoint} from '@prisma/client';

export const measurementSchema = z.object({
    measurePoints: z.enum([MeasurePoint.BEDROOM, MeasurePoint.LIVING_ROOM, MeasurePoint.OUTSIDE]),
    value: z.number().min(-40).max(45)
});