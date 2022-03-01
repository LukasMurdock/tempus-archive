import { Event } from '@prisma/client';
import {
    addWeeks,
    eachDayOfInterval,
    endOfWeek,
    format,
    formatDuration,
    getDay,
    getHours,
    getMinutes,
    getOverlappingDaysInIntervals,
    intervalToDuration,
    isAfter,
    isBefore,
    isSameWeek,
    isWeekend,
    nextMonday,
    parseISO,
    setHours,
    setMilliseconds,
    setMinutes,
    setSeconds,
    startOfWeek,
    toDate,
} from 'date-fns';
import RRule from 'rrule';
import { db } from '~/utils/db.server';

export function daysOfWeek() {
    const currentDate = new Date();
    const weekStartsOn = 1;
    return eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn }),
        end: endOfWeek(currentDate, { weekStartsOn }),
    });
}

// TODO: rrule parsing to actually build in recurring dates
export async function generateRecurringEvents(event: Event) {
    // fuck it let’s use https://jakubroztocil.github.io/rrule/
    // const nextWeekFormatted = format(
    //     nextMonday(new Date()),
    //     "yyyymmdd'T'000000'Z'"
    // );

    const nextWeekFormatted = format(
        endOfWeek(new Date()),
        "yyyyMMdd'T'000000'Z'"
    );
    console.log('AHHHH');
    console.log(nextWeekFormatted);

    // 2011-10-05T14:48:00.000Z
    // 20301224T000000Z
    // 20301224T000000Z
    // 20130130T230000Z
    // 20220301T000000Z
    // 20220305T000000Z
    console.log('desired: 20220304T000000Z');
    console.log('we got: ' + nextWeekFormatted);

    // WKST required
    const rule = RRule.fromString(
        `FREQ=WEEKLY;UNTIL=${nextWeekFormatted};WKST=SU;BYDAY=TU,TH`
    );

    // return rule.all();
    console.log(rule.all().length);
    console.log('rule length');
    return rule
        .all()
        .map((recurringStart) => ({ ...event, start: recurringStart }));
}

export function parseEventData(event: Event) {
    // console.log(event);
    // console.log('hello');
    const currentDate = new Date();
    const timeFormat = 'hh:mm aa';
    const dateFormat = 'MM/dd'; // 'yyyy-MM-dd'

    const startDate = parseISO(event.start);
    const startingDayOfWeek = getDay(startDate);
    const endDate = parseISO(event.end);
    const endDateAtStartDate = setMinutes(
        setHours(startDate, getHours(endDate)),
        getMinutes(endDate)
    );
    // endDate = startDate setTime endTime

    const startDateFormatted = format(startDate, dateFormat);
    const startTimeFormatted = format(startDate, timeFormat);
    // const endTimeFormatted = format(endDate, timeFormat);
    const isPassed = isAfter(currentDate, startDate); // isStartPassed?
    const timeUntil = formatDuration(
        intervalToDuration({
            start: currentDate,
            end: startDate,
        }),
        {
            //   delimiter: ' ',
            format: ['months', 'weeks', 'days', 'hours', 'minutes'],
        }
    );

    return {
        ...event,
        startDate,
        endDate,
        endDateAtStartDate,
        startDateFormatted,
        startTimeFormatted,
        isPassed,
        timeUntil,
        startingDayOfWeek,
    };
}

export async function getWeeklyRecurringEvents() {
    return await db.event.findMany({
        where: { isRecurring: true },
    });
}

export async function getRecurringEvents() {
    // const currentDate = new Date();
    return await db.event.findMany({
        where: {
            isRecurring: true,
            // start: {
            //     // lt: endOfWeek(currentDate).toISOString(),
            //     gt: startOfWeek(currentDate).toISOString(),
            // },
        },
    });
}

export async function getNonRecurringEvents() {
    return await db.event.findMany({
        where: { isRecurring: false },
    });
}

export async function getEvents() {
    return await db.event.findMany();
}

// NOW if not weekend => isThisWeek, else => today till next week
// 02/11 ECO 202 Ch. 5 Prep 1d 15h 11m
// WEEKEND (isWeekend)
// NEXT WEEK (isAfter(nextMonday) && isBefore(addDays(nextMonday + 7))) || isBefore(nextSunday)
// SOON (isAfter(nextSunday))

function sortEventsByDate(a: Event, b: Event) {
    return a.start > b.start ? 1 : -1;
}

function isEventThisWeek(event: Event) {
    return isSameWeek(new Date(), parseISO(event.start));
}

function isEventNow(event: Event) {
    return (
        isSameWeek(new Date(), parseISO(event.start)) &&
        !isWeekend(parseISO(event.start))
    );
}

function isEventWeekend(event: Event) {
    return (
        isWeekend(parseISO(event.start)) &&
        isBefore(parseISO(event.start), nextMonday(new Date()))
    );
}

function isEventNextWeek(event: Event) {
    return (
        isWeekend(parseISO(event.start)) &&
        isAfter(parseISO(event.start), nextMonday(new Date()))
    );
}

function isEventSoon(event: Event) {
    console.log('next week: ' + addWeeks(new Date(), 1));
    return isAfter(parseISO(event.start), addWeeks(new Date(), 2));
}

interface AdvancedEvent extends Event {}
export function gettingEventsDone(events: Event[]) {
    // TODO: do we have recurring events here? Current answer: no

    // Trading off passing a single new Date() for concise functions.

    return {
        now: events.filter(isEventNow).sort(sortEventsByDate),
        weekend: events.filter(isEventWeekend).sort(sortEventsByDate),
        next_week: events.filter(isEventNextWeek).sort(sortEventsByDate),
        soon: events.filter(isEventSoon).sort(sortEventsByDate),
    };
}

export async function deleteEventById(id: string) {
    const event = await db.event.delete({
        where: { id },
    });
    return event;
}

export async function getEventById(id: string) {
    const event = await db.event.findUnique({
        where: { id },
    });
    return event;
}

export async function getEventByTitle(title: string) {
    const event = await db.event.findFirst({
        where: { title },
    });
    return event;
}

type EventToCreate = {
    title: string;
    start: string;
    end: string;
    duration: number;
    isRecurring: boolean;
    recurringPattern: string;
};
export async function createEvent(event: EventToCreate) {
    const createdEvent = await db.event.create({ data: event });
    return createdEvent;
}

export async function eventAlreadyExists() {}
