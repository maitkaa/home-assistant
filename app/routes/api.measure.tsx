import {createErrorLog} from '../models/error-log.server';
import {ActionFunctionArgs, json} from '@remix-run/node';
import {measurementSchema} from '../schema/measurement';
import {createMeasurement} from '../models/measurement.server';
import {isAuthorized} from '../utils/auth.server';
import {emitter} from '../utils/emitter.server';

export const authHeaders = () => ({
    "WWW-Authenticate": "Basic",
});

export async function action({request}: ActionFunctionArgs) {
    if (!isAuthorized(request)) {
        return json({ authorized: false }, { status: 401 });
    }

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
        emitter.emit("measurement-created");
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