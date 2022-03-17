import { differenceInMinutes, parse, parseJSON } from 'date-fns';
import { toDate, format } from 'date-fns-tz';
import { useEffect, useState } from 'react';
import { ActionFunction, json, useActionData } from 'remix';
import { Form, redirect } from 'remix';
import {
    createEvent,
    eventAlreadyExists,
    getEventByTitle,
} from '~/utils/db.events';
import { db } from '~/utils/db.server';

type EventSchema = {
    title: string;
    start: string; // Date: ISO 8601
    end: string; // Date: ISO 8601
    duration: string; // 01:30 — differenceInMinutes(dateLeft, dateRight, [options])
    isRecurring: boolean;
};

function localTimeToDate({
    time,
    date,
    timezone,
}: {
    time: string;
    date: Date;
    timezone: string;
}) {
    return zonedTimeToDate(
        date.toISOString().split('T')[0] + 'T' + time,
        timezone
    );
}

function zonedTimeToDate(string: string, timezone: string) {
    // https://github.com/marnusw/date-fns-tz#todate
    return toDate(string, { timeZone: timezone });
}

function concatByDayFormData(formData: FormData) {
    const byDayArray = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const days = byDayArray.filter((day) => formData.get(day) && day);
    return days.join(',');
}

function formatEndDate(start: FormData, end: FormData) {
    return String(start).split('T')[0] + end;
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    console.log(formData);

    const title = String(formData.get('title'));

    const alreadyExists = await getEventByTitle(title);

    if (alreadyExists) {
        console.log('ERROR: already exists');
        return json({
            error: { title: 'An event with this title already exists.' },
        });
    }

    const timezone = String(formData.get('timezone'));

    if (!timezone || !title) {
        console.log('ERROR: Form not submitted correctly');
        throw new Error('Form not submitted correctly.');
    }

    const startForm = String(formData.get('start'));
    // 2022-02-23T13:44
    const endForm = String(formData.get('end'));
    // 14:44

    const start = zonedTimeToDate(startForm, timezone);
    const end = localTimeToDate({ time: endForm, date: start, timezone });
    const duration = Math.abs(differenceInMinutes(start, end));
    const byDays = concatByDayFormData(formData);
    const isRecurring = byDays !== '';

    const patterns = ['FREQ=WEEKLY', 'BYDAYS=' + byDays];

    const recurringPattern = isRecurring ? patterns.join(';') : '';

    const event = {
        title,
        start: start.toISOString(),
        end: end.toISOString(),
        duration,
        isRecurring,
        recurringPattern,
        // ...(isRecurring ? { isRecurring, byDays } : { isRecurring }),
    };

    // console.log('start: ' + start);
    // console.log('end: ' + end);
    // console.log('duration: ' + duration);
    // console.log('isRecurring: ' + isRecurring);
    // console.log('byDays: ' + byDays);
    console.log(event);

    // const dateTimeLocalFormat = "yyyy-MM-dd'T'HH:mm";
    // const start = parse(startForm, dateTimeLocalFormat, new Date());

    const created = await createEvent(event);

    // return redirect(`/events/${created.id}`);
    return redirect(`/events/`);

    // TODO: have duration generated in createEvent() function

    // const event = await createEvent(formData);
    // return redirect(`/events/${event.id}`);
};

const Label = ({ htmlFor, label }: { htmlFor: string; label: string }) => (
    <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
    >
        {label}
    </label>
);

const ByDaySelector = () => {
    // const byDayArray = ["M", "T", "W", "R", "F", "S", "U"]
    const byDayArray = [
        { RRULE: 'MO', short: 'M' },
        { RRULE: 'TU', short: 'T' },
        { RRULE: 'WE', short: 'W' },
        { RRULE: 'TH', short: 'R' },
        { RRULE: 'FR', short: 'F' },
        { RRULE: 'SA', short: 'S' },
        { RRULE: 'SU', short: 'U' },
    ];

    return (
        <fieldset className="grid grid-cols-7 gap-2">
            {byDayArray.map((weekday) => (
                <label key={weekday.RRULE}>
                    <input
                        id={weekday.RRULE}
                        name={weekday.RRULE}
                        type="checkbox"
                        className="peer sr-only"
                    />
                    <span className="block cursor-pointer rounded-md p-2 text-center hover:bg-gray-100 peer-checked:bg-gray-200">
                        {weekday.short}
                    </span>
                </label>
            ))}
        </fieldset>
    );
};

export default function NewEvent() {
    const [startDate, setStartDate] = useState<string>();
    // need to get hh:mm
    const action = useActionData();
    console.log(action);

    return (
        <div className="m-auto max-w-sm">
            <Form method="post" className="space-y-4 py-4">
                <input
                    type="hidden"
                    id="timezone"
                    name="timezone"
                    value={Intl.DateTimeFormat().resolvedOptions().timeZone}
                />

                <ByDaySelector />

                <div>
                    <Label htmlFor="title" label="Title" />
                    <input
                        required
                        type="text"
                        name="title"
                        id="title"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    {action?.error?.title && (
                        <p className="text-red-600">{action.error.title}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor="start" label="Day and start time" />
                    <input
                        required
                        type="datetime-local"
                        name="start"
                        id="start"
                        onChange={(e) => setStartDate(e.target.value)}
                        // onChange={(e) => console.log(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <div>
                    <Label htmlFor="end" label="End" />
                    <input
                        required
                        type="time"
                        name="end"
                        min={startDate?.split('T')[1] ?? '00:00'}
                        id="end"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                </div>

                <p>
                    <button
                        type="submit"
                        className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add event
                    </button>
                </p>
            </Form>
        </div>
    );
}
