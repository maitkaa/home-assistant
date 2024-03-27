import {ActionFunctionArgs} from '@remix-run/node';
import {measurementSchema} from '../schema/measurement';
import {createMeasurement} from '../models/measurement.server';

export async function action({request}: ActionFunctionArgs) {
    const formData = await request.json();
    const validate = measurementSchema.safeParse(formData);
    if (!validate.success) {
        return new Response(JSON.stringify(validate.error), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    try {
        await createMeasurement(validate.data.value, validate.data.measurePoints);
        return new Response(JSON.stringify({message: 'Measurement created successfully'}), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        // @ts-ignore TODO proper error handling (log to database)
        return new Response(JSON.stringify({message: 'Error creating measurement', error: error.message}), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}