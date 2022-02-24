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

const EventAnalogProgress = ({
    startDate,
    newDate,
}: {
    startDate: Date;
    newDate: Date;
}) => {
    return <div>{differenceInMinutes(startDate, newDate)}</div>;
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
                            <div className="divide-y-2">
                                {event.events.map((data) => (
                                    <EventBlock
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
