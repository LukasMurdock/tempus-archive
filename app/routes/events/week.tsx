import type { Event } from '@prisma/client';
import { Link, LoaderFunction, useLoaderData } from 'remix';
import { useEffect, useRef } from 'react';
import {
    daysOfWeek,
    generateRecurringEvents,
    getEvents,
    getRecurringEvents,
    parseEventData,
} from '~/utils/db.events';
import {
    format,
    getHours,
    getMinutes,
    isSameDay,
    isSameWeek,
    parseISO,
} from 'date-fns';
import classNames from '~/utils/classNames';

type LoaderData = Event[];
export let loader: LoaderFunction = async () => {
    // const events = await getEvents();
    const recurringEvents = await getRecurringEvents();

    // const allRecurringEvents = await Promise.all(
    //     recurringEvents.map(async (single) => {
    //         return await generateRecurringEvents(single);
    //     })
    // );

    const allRecurringEvents = await Promise.all(
        recurringEvents.map(
            async (single) => await generateRecurringEvents(single)
        )
    );

    // const sortedEvents = allRecurringEvents
    //     .flat(1)
    //     .sort((a, b) => a.start.getTime() - b.start.getTime());

    // // console.log(allRecurringEvents.flat(1));
    // const currentDate = new Date();
    // console.log('SORTED');
    // console.log(sortedEvents.length);
    // console.log('SORTED');

    // console.log(sortedEvents[1]);

    // const recurringThisWeek = sortedEvents.filter((date) =>
    //     isSameWeek(currentDate, date.start)
    // );

    // console.log('START');
    // // console.log(recurringThisWeek);
    // console.log('START');
    // console.log(recurringThisWeek.length);
    // console.log('LENGTH ABOVE');

    // console.log(allRecurringEvents);
    // console.log('allRecurringEvents');
    return allRecurringEvents.flat(1);
};

function roundToNearestFifth(number: number) {
    return Math.ceil(number / 5) * 5;
}

function timeToGridRow(date: Date) {
    const oneAM = 14;
    const fiveMinuteIncrement = 3;
    const hourMultiplier = 12; // wrong
    const hourNumber = 2 + getHours(date) * hourMultiplier;
    const minuteNumber = roundToNearestFifth(getMinutes(date));
    // console.log(minuteNumber);
    const gridRowString = `${hourNumber} / span 12`;
    return gridRowString;
    // return hourNumber + minuteNumber;
}

const oneAM = 14;
const oneFifteenAM = 17; // 3
const oneThirtyAM = 20; //
const twoAM = 26; // 12
const threeAM = 38; // 12
const fourAM = 50; // 12
const fiveAM = 62; // 12
const sixAM = 74; // 12
// const sevenAM = ;
const twelveAM = 146;

const EventWeekItem = ({ event }: { event: Event }) => {
    const data = parseEventData(event);
    // console.log(data);
    // console.log(timeToGridRow(data.startDate));
    // console.log(data.startingDayOfWeek);
    // console.log('AHHHHH');
    console.log(data.startingDayOfWeek);
    const timeStyle = `sm:col-start-${data.startingDayOfWeek}`;
    return (
        <li
            className={classNames('relative mt-px flex', timeStyle)}
            style={{ gridRow: timeToGridRow(data.startDate) }} // 6:00 AM
        >
            <Link
                to={`/events/${data.id}`}
                className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-blue-50 p-2 text-xs leading-5 hover:bg-blue-100"
            >
                <p className="order-1 font-semibold text-blue-700">
                    {data.title}
                </p>
                {/* <div className="prose">
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div> */}
                <p className="text-blue-500 group-hover:text-blue-700">
                    <time dateTime={data.start}>{data.startTimeFormatted}</time>
                </p>
            </Link>
        </li>
    );
};

export default function Week() {
    const container = useRef(null);
    const containerNav = useRef(null);
    const containerOffset = useRef(null);
    const events = useLoaderData<LoaderData>();
    console.log(events);
    const currentDate = new Date();

    // return <div>Check console</div>;

    // useEffect(() => {
    //     // Set the container scroll position based on the current time.
    //     if (
    //         container &&
    //         containerNav &&
    //         container.current &&
    //         containerNav.current &&
    //         containerOffset &&
    //         containerOffset.current
    //     ) {
    //         const currentMinute = new Date().getHours() * 60;
    //         container.current.scrollTop =
    //             ((container.current.scrollHeight -
    //                 containerNav.current.offsetHeight -
    //                 containerOffset.current.offsetHeight) *
    //                 currentMinute) /
    //             1440;
    //     }
    // }, []);

    return (
        <div>
            <div
                ref={container}
                className="flex flex-auto flex-col overflow-auto bg-white"
            >
                <div
                    style={{ width: '165%' }}
                    className="flex max-w-full flex-none flex-col sm:max-w-none md:max-w-full"
                >
                    <div
                        ref={containerNav}
                        className="sticky top-0 z-10 flex-none bg-white shadow ring-1 ring-black ring-opacity-5 sm:pr-8"
                    >
                        <div className="grid grid-cols-7 text-sm leading-6 text-gray-500 sm:hidden">
                            {daysOfWeek().map((weekday) => (
                                <button
                                    key={weekday.toISOString()}
                                    type="button"
                                    className="flex flex-col items-center pt-2 pb-3"
                                >
                                    {weekday.getMonth()}
                                    <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                                        {format(weekday, 'dd')}
                                    </span>
                                </button>
                            ))}
                            <button
                                type="button"
                                className="flex flex-col items-center pt-2 pb-3"
                            >
                                M{' '}
                                <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                                    10
                                </span>
                            </button>
                            <button
                                type="button"
                                className="flex flex-col items-center pt-2 pb-3"
                            >
                                T{' '}
                                <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                                    11
                                </span>
                            </button>
                            <button
                                type="button"
                                className="flex flex-col items-center pt-2 pb-3"
                            >
                                W{' '}
                                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-black font-semibold text-white">
                                    12
                                </span>
                            </button>
                            <button
                                type="button"
                                className="flex flex-col items-center pt-2 pb-3"
                            >
                                T{' '}
                                <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                                    13
                                </span>
                            </button>
                            <button
                                type="button"
                                className="flex flex-col items-center pt-2 pb-3"
                            >
                                F{' '}
                                <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                                    14
                                </span>
                            </button>
                            <button
                                type="button"
                                className="flex flex-col items-center pt-2 pb-3"
                            >
                                S{' '}
                                <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                                    15
                                </span>
                            </button>
                            <button
                                type="button"
                                className="flex flex-col items-center pt-2 pb-3"
                            >
                                S{' '}
                                <span className="mt-1 flex h-8 w-8 items-center justify-center font-semibold text-gray-900">
                                    16
                                </span>
                            </button>
                        </div>

                        <div className="-mr-px hidden grid-cols-7 divide-x divide-gray-100 border-r border-gray-100 text-sm leading-6 text-gray-500 sm:grid">
                            <div className="col-end-1 w-14" />
                            {daysOfWeek().map((weekday) => (
                                <div
                                    key={weekday.toISOString()}
                                    className="flex items-center justify-center py-3"
                                >
                                    <span
                                        className={classNames(
                                            isSameDay(weekday, currentDate)
                                                ? 'flex items-baseline'
                                                : ''
                                        )}
                                    >
                                        {format(weekday, 'EEE')}{' '}
                                        <span
                                            className={classNames(
                                                isSameDay(weekday, currentDate)
                                                    ? 'ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black font-semibold text-white'
                                                    : 'items-center justify-center font-semibold text-gray-900'
                                            )}
                                        >
                                            {format(weekday, 'd')}
                                        </span>
                                    </span>
                                </div>
                            ))}
                            {/* <div className="flex items-center justify-center py-3">
                                <span>
                                    Mon{' '}
                                    <span className="items-center justify-center font-semibold text-gray-900">
                                        10
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center justify-center py-3">
                                <span>
                                    Tue{' '}
                                    <span className="items-center justify-center font-semibold text-gray-900">
                                        11
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center justify-center py-3">
                                <span className="flex items-baseline">
                                    Wed{' '}
                                    <span className="ml-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black font-semibold text-white">
                                        12
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center justify-center py-3">
                                <span>
                                    Thu{' '}
                                    <span className="items-center justify-center font-semibold text-gray-900">
                                        13
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center justify-center py-3">
                                <span>
                                    Fri{' '}
                                    <span className="items-center justify-center font-semibold text-gray-900">
                                        14
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center justify-center py-3">
                                <span>
                                    Sat{' '}
                                    <span className="items-center justify-center font-semibold text-gray-900">
                                        15
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center justify-center py-3">
                                <span>
                                    Sun{' '}
                                    <span className="items-center justify-center font-semibold text-gray-900">
                                        16
                                    </span>
                                </span>
                            </div> */}
                        </div>
                    </div>
                    <div className="flex flex-auto">
                        <div className="sticky left-0 w-14 flex-none bg-white ring-1 ring-gray-100" />
                        <div className="grid flex-auto grid-cols-1 grid-rows-1">
                            {/* Horizontal lines */}
                            <HorizontalLines
                                containerOffset={containerOffset}
                            />
                            {/* Vertical lines */}
                            <div className="col-start-1 col-end-2 row-start-1 hidden grid-cols-7 grid-rows-1 divide-x divide-gray-100 sm:grid sm:grid-cols-7">
                                <div className="col-start-1 row-span-full" />
                                <div className="col-start-2 row-span-full" />
                                <div className="col-start-3 row-span-full" />
                                <div className="col-start-4 row-span-full" />
                                <div className="col-start-5 row-span-full" />
                                <div className="col-start-6 row-span-full" />
                                <div className="col-start-7 row-span-full" />
                                <div className="col-start-8 row-span-full w-8" />
                            </div>

                            {/* Events */}
                            <ol
                                className="col-start-1 col-end-2 row-start-1 grid grid-cols-1 sm:grid-cols-7 sm:pr-8"
                                style={{
                                    gridTemplateRows:
                                        '1.75rem repeat(288, minmax(0, 1fr)) auto',
                                }}
                            >
                                {events.map((event) => (
                                    <EventWeekItem
                                        event={event}
                                        key={event.start}
                                    />
                                ))}
                                {/* <li
                                    className="relative mt-px flex sm:col-start-3"
                                    style={{ gridRow: '74 / span 12' }}
                                >
                                    <a
                                        href="#"
                                        className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-blue-50 p-2 text-xs leading-5 hover:bg-blue-100"
                                    >
                                        <p className="order-1 font-semibold text-blue-700">
                                            Breakfast
                                        </p>
                                        <p className="text-blue-500 group-hover:text-blue-700">
                                            <time dateTime="2022-01-12T06:00">
                                                6:00 AM
                                            </time>
                                        </p>
                                    </a>
                                </li> */}
                                {/* <li
                                    className="relative mt-px flex sm:col-start-3"
                                    style={{ gridRow: '92 / span 30' }}
                                >
                                    <a
                                        href="#"
                                        className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-pink-50 p-2 text-xs leading-5 hover:bg-pink-100"
                                    >
                                        <p className="order-1 font-semibold text-pink-700">
                                            Flight to Paris
                                        </p>
                                        <p className="text-pink-500 group-hover:text-pink-700">
                                            <time dateTime="2022-01-12T07:30">
                                                7:30 AM
                                            </time>
                                        </p>
                                    </a>
                                </li> */}
                                {/* <li
                                    className="relative mt-px hidden sm:col-start-6 sm:flex"
                                    style={{ gridRow: '122 / span 24' }}
                                >
                                    <a
                                        href="#"
                                        className="group absolute inset-1 flex flex-col overflow-y-auto rounded-lg bg-gray-100 p-2 text-xs leading-5 hover:bg-gray-200"
                                    >
                                        <p className="order-1 font-semibold text-gray-700">
                                            Meeting with design team at Disney
                                        </p>
                                        <p className="text-gray-500 group-hover:text-gray-700">
                                            <time dateTime="2022-01-15T10:00">
                                                10:00 AM
                                            </time>
                                        </p>
                                    </a>
                                </li> */}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const HorizontalLines = ({ containerOffset }: { containerOffset: any }) => {
    return (
        <div
            className="col-start-1 col-end-2 row-start-1 grid divide-y divide-gray-100"
            style={{
                gridTemplateRows: 'repeat(48, minmax(3.5rem, 1fr))',
            }}
        >
            <div ref={containerOffset} className="row-end-1 h-7"></div>
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    12AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    1AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    2AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    3AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    4AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    5AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    6AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    7AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    8AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    9AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    10AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    11AM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    12PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    1PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    2PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    3PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    4PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    5PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    6PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    7PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    8PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    9PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    10PM
                </div>
            </div>
            <div />
            <div>
                <div className="sticky left-0 -mt-2.5 -ml-14 w-14 pr-2 text-right text-xs leading-5 text-gray-400">
                    11PM
                </div>
            </div>
            <div />
        </div>
    );
};
