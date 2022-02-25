import type { Event } from '@prisma/client';
import { Form, Link, Outlet, useLoaderData } from 'remix';
import type { LoaderFunction, ActionFunction } from 'remix';
import { db } from '~/utils/db.server';
import {
    deleteEventById,
    getEvents,
    getNonRecurringEvents,
    gettingEventsDone,
} from '~/utils/db.events';
import {
    differenceInMinutes,
    Duration,
    format,
    formatDuration,
    intervalToDuration,
    isAfter,
    parseISO,
} from 'date-fns';

// type LoaderData = { events: Array<Event> };
// export let loader: LoaderFunction = async () => {
//     const data: LoaderData = {
//         events: await getEvents(),
//     };
//     return data;
// };

type LoaderData = {
    now: Event[];
    weekend: Event[];
    next_week: Event[];
    soon: Event[];
    [key: string]: Event[];
};
export let loader: LoaderFunction = async () => {
    const events = await getNonRecurringEvents();

    const data: LoaderData = gettingEventsDone(events);
    return data;
};

// const test = gettingEventsDone(await db.event.findMany());

// export let action: ActionFunction = async ({ request }) => {
//     let formData = await request.formData();
//     // let { _action, id } = Object.fromEntries(formData);
//     let _action = formData.get('_action');
//     let id = String(formData.get('id'));

//     if (!_action || !id) return null;

//     if (_action === 'create') {
//     }

//     if (_action === 'delete') {
//         console.log(id);
//         const data = await deleteEventById(id);
//         console.log(data);
//         return data;
//     }
// };

const ProgressRing = ({ progress }: { progress: number }) => {
    const radius = 16;
    const stroke = 5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    // const strokeDashoffset = circumference - progress * circumference;

    return (
        <svg height={radius * 2} width={radius * 2}>
            <circle
                stroke="blue"
                fill="transparent"
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset: strokeDashoffset }}
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
};

const EventAnalogProgress = ({
    startDate,
    newDate,
}: {
    startDate: Date;
    newDate: Date;
}) => {
    const minutesTill = differenceInMinutes(startDate, newDate);

    if (minutesTill > 60) {
        return null;
    }

    return <ProgressRing progress={(29 / 30) * 100} />;
};

function getDurationColor(duration: Duration) {
    if (
        !duration.years &&
        !duration.months &&
        !duration.weeks &&
        !duration.days &&
        !duration.hours &&
        duration.minutes
    ) {
        if (duration.minutes > 34) return 'red-400';
        if (duration.minutes > 29) return 'red-500';
        return 'red-600';
        // format 1 hour -> light red
        // format 30 mins -> red
        // format 25 mins -> ultra red
    }
}

const EventGTDBlock = ({ event, newDate }: { event: Event; newDate: Date }) => {
    const timeFormat = 'h:mmaaa';
    const dateFormat = 'EEE, MMM dd'; // 'yyyy-MM-dd' 'MM/dd'
    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    const startDateFormatted = format(startDate, dateFormat);
    const startTimeFormatted = format(startDate, timeFormat);
    const endTimeFormatted = format(endDate, timeFormat);
    const isPassed = isAfter(newDate, startDate); // isStartPassed?
    const duration = intervalToDuration({
        start: newDate,
        end: startDate,
    });
    const timeUntil = formatDuration(duration, {
        //   delimiter: ' ',
        format: ['months', 'weeks', 'days', 'hours', 'minutes'],
    });
    return (
        <div key={event.id} className="grid grid-cols-2 py-3">
            <div>
                <p className="text-sm uppercase text-gray-500">
                    {startDateFormatted}
                </p>
                <p className="text-sm">
                    {startTimeFormatted} - {endTimeFormatted}
                </p>
            </div>
            <div>
                <Link to={`/events/${event.id}`}>
                    <p className="font-bold text-gray-800 hover:underline">
                        {event.title}
                    </p>
                </Link>
                {isPassed ? (
                    <p>{isPassed && 'Event has passed'}</p>
                ) : (
                    <p className={`text-${getDurationColor(duration)}`}>
                        {timeUntil} remaining
                    </p>
                )}
            </div>
            {/* <Link
                    to={`/events/${event.id}`}
                    className="inline-block rounded-md bg-gray-100 px-4 py-3"
                >
                    Edit
                </Link> */}
        </div>
    );
};

const EventBlock = ({ event, newDate }: { event: Event; newDate: Date }) => {
    // const dateTimeLocalFormat = "yyyy-MM-dd'T'HH:mm";
    // timeFormat 12-hour: 'hh:mm'
    // timeFormat 24-hour: 'HH:mm'

    const timeFormat = 'hh:mm';
    const dateFormat = 'MM/dd'; // 'yyyy-MM-dd'
    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    const startDateFormatted = format(startDate, dateFormat);
    const startTimeFormatted = format(startDate, timeFormat);
    const endTimeFormatted = format(endDate, timeFormat);
    const isPassed = isAfter(newDate, startDate); // isStartPassed?
    const timeUntil = formatDuration(
        intervalToDuration({
            start: newDate,
            end: startDate,
        }),
        {
            //   delimiter: ' ',
            format: ['months', 'weeks', 'days', 'hours', 'minutes'],
        }
    );
    return (
        <div key={event.id}>
            {/* <p>{newDate.toISOString()}</p>
            <p>{startDate.toISOString()}</p> */}
            {startDateFormatted}{' '}
            <Link to={`/events/${event.id}`}>
                <span className="hover:underline">{event.title}</span>
            </Link>{' '}
            {startTimeFormatted} - {endTimeFormatted}
            {isPassed ? (
                <p>{isPassed && 'Event has passed'}</p>
            ) : (
                <p>{timeUntil} remaining</p>
            )}
            <EventAnalogProgress newDate={newDate} startDate={startDate} />
            {/* <Link
                to={`/events/${event.id}`}
                className="inline-block rounded-md bg-gray-100 px-4 py-3"
            >
                Edit
            </Link> */}
        </div>
    );
};

const EventMap = [
    { accessor: 'now', title: 'now' },
    { accessor: 'weekend', title: 'weekend' },
    { accessor: 'next_week', title: 'next week' },
    { accessor: 'soon', title: 'soon' },
];

export default function Events() {
    const data = useLoaderData<LoaderData>();

    const eventData = EventMap.map((event) => ({
        ...event,
        events: data[event.accessor],
    }));
    const newDate = new Date();

    return (
        <div>
            <nav>
                <Link
                    to="/events/new"
                    className="block rounded-lg p-2 text-center font-bold text-gray-900 hover:bg-gray-100"
                >
                    New event
                </Link>
            </nav>

            <Outlet />
            <main>
                <div className="space-y-4">
                    {eventData.map((event) => (
                        <div key={event.accessor}>
                            <h2 className="font-bold uppercase">
                                {event.title}
                            </h2>
                            <div className="divide-y divide-stone-500">
                                {event.events.map((data) => (
                                    // <EventBlock
                                    //     key={data.id}
                                    //     event={data}
                                    //     newDate={newDate}
                                    // />
                                    <EventGTDBlock
                                        key={data.id}
                                        event={data}
                                        newDate={newDate}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="divide-y-2">
                    {/* {data.events.map((event) => (
                        <div key={event.id}>
                            <h2 className="font-bold">{event.title}</h2>
                            <p>Start: {event.start}</p>
                            <p>End: {event.end}</p>
                            <p>{event.recurringPattern}</p>
                            <p>{event.duration}</p>
                            <Link
                                to={`/events/${event.id}`}
                                className="inline-block rounded-md bg-gray-100 px-4 py-3"
                            >
                                Edit
                            </Link>
                        </div>
                    ))} */}
                </div>
            </main>
        </div>
    );
}
