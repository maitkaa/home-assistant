import {MeasurementAverage} from '../models/measurement.server';


export function formatMeasurementsData(measurements: MeasurementAverage[]): number[] {
    const aggregatedData: { [key: string]: number } = {};

    measurements.forEach(measurement => {
        const date = new Date(measurement.interval);
        const hour = date.getUTCHours();
        const minute = Math.floor(date.getUTCMinutes() / 15) * 15;
        const adjustedHour = hour < 6 ? hour + 24 : hour; // Adjust hours for the next day
        const index = `${((adjustedHour - 6) * 4) + (minute / 15)}`;

        aggregatedData[index] = measurement.average_value;
    });

    const formattedData = Array(76).fill(null);
    for (const index in aggregatedData) {
        formattedData[Number(index)] = aggregatedData[index];
    }

    return formattedData;
}

/**
 * Generate labels for the chart
 * @returns {string[]} - Array of labels
 */
export function generateLabels(): string[] {
    const labels = [];
    for (let i = 0; i < 76; i++) {
        const hour = (Math.floor(i / 4) + 6) % 24;
        const minute = (i % 4) * 15;
        labels.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
    return labels;
}