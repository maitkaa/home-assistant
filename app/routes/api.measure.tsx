import {createErrorLog} from '../models/error-log.server';
import {ActionFunctionArgs} from '@remix-run/node';
import {measurementSchema} from '../schema/measurement';
import {createMeasurement} from '../models/measurement.server';

export async function action({request}: ActionFunctionArgs) {
    const requestData = await request.json();
    const validate = measurementSchema.safeParse(requestData);
    if (!validate.success) {
        return new Response(JSON.stringify(validate.error), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    try {
        await createMeasurement(validate.data.value, validate.data.measurePoint);
        return new Response(JSON.stringify({message: 'Measurement created successfully'}), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        const err = error as Error;
        await createErrorLog(err.message, validate.data.measurePoint);
        return new Response(JSON.stringify({message: 'Error creating measurement', error: err.message}), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}