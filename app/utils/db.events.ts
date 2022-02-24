import { Event } from '@prisma/client';
import {
    addWeeks,
    format,
    formatDuration,
    intervalToDuration,
    isAfter,
    isBefore,
    isSameWeek,
    isWeekend,
    nextMonday,
    parseISO,
} from 'date-fns';
import { db } from '~/utils/db.server';

// TODO: rrule parsing to actually build in recurring dates
export function getAllOccurancesForRecurringDate(event: Event) {
    // fuck it let’s use https://jakubroztocil.github.io/rrule/
}

export function parseEventData(event: Event) {
    const currentDate = new Date();
    const timeFormat = 'hh:mm aa';
    const dateFormat = 'MM/dd'; // 'yyyy-MM-dd'

    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    const startDateFormatted = format(startDate, dateFormat);
    const startTimeFormatted = format(startDate, timeFormat);
    const endTimeFormatted = format(endDate, timeFormat);
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
        startDateFormatted,
        startTimeFormatted,
        endTimeFormatted,
        isPassed,
        timeUntil,
    };
}

export async function getRecurringEvents() {
    return await db.event.findMany({
        where: { isRecurring: false },
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
