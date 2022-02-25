# Countdown Calendar

1. Ensure duplicate event names can’t be added to database

## Prisma

warn You already have a .gitignore. Don't forget to exclude .env to not commit any secret.

Next steps:

1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Run prisma db pull to turn your database schema into a Prisma schema.
3. Run prisma generate to generate the Prisma Client. You can then start querying your database.

More information in our documentation:
https://pris.ly/d/getting-started

If your database gets messed up, you can always delete the prisma/dev.db file and run `npx prisma db push` again.

## General

-   Recurrence pattern
-   Start date / start time
-   End date
-   Title

(MWF) 2022-02-22 04:30PM-05:30PM CSE 252

(MWF) 04:30PM-05:30PM CSE 252

Generate:

-   UID
-   Calculate duration
-   Recurrence pattern

```typescript
const byDayArray = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];

const byDayMap = {
    M: 'MO',
    T: 'TU',
    W: 'WE',
    R: 'TH',
    F: 'FR',
    S: 'SA',
    U: 'SU',
};

function getByDayFromRecurrencePattern(string: string) {
    return pattern.split('').map((letter) => byDayMap[letter]);
}
```

```typescript
type EventSchema = {
    id: string; // generated UID
    title: string;
    start: string; // Date: ISO 8601
    end: string; // Date: ISO 8601
    duration: string; // 01:30 — differenceInMinutes(dateLeft, dateRight, [options])
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time#time_value_format
    isRecurring: boolean;
    recurringPattern: string; // FREQ=WEEKLY;BYDAY=MO,WE

    // RRULE:
    // https://www.rfc-editor.org/rfc/rfc5545#section-3.8.5.3
    // https://www.npmjs.com/package/rrule

    // recurring pattern
    FREQ: Frequency; // 'daily' | 'weekly' | 'monthly' | 'yearly'
    UNTIL: enddate;
    COUNT: number; // times to recur
    INTERVAL: number; // ??
    WKST: 'SU'; // week start?
    BYDAY: 'TU,TH'; // by day, comma-separated list of days of the week
    byDay: string; // "MWF";
};

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

type Weekday =
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';

type EventException = {
    eventId: string; // event unique id
    exceptionDate: string; // Date: ISO 8601
};

let eventExample = {
    title: 'First event',
    start: '2022-02-23T15:30:00+0000',
    end: '2022-02-23T17:30:00+0000',
    duration: '01:30',
    // start: '15:30',
    // end: '16:60',
    isRecurring: false,
    recurrencePattern: 'FREQ=DAILY;INTERVAL=10;COUNT=5',
};
```

Add event
<input type="text" name="title" /> Title
<input type="datetime-local" /> Day and start time
<input type="time" /> End time

Options:

-   Recurring (interval)? <input type="radio" /> Daily | Weekly | Monthly | Yearly
-   Interval period? <fieldset><input type="checkbox" />M T W T F S S
-   Interval end? <input type="checkbox" />Endlessly | <input type="date" />Til
-   Location? <input type="text" name="location" />
-   Notifications?

NOW if not weekend => isThisWeek, else => today till next week
02/11 ECO 202 Ch. 5 Prep 1d 15h 11m
WEEKEND (isWeekend)
NEXT WEEK (isAfter(nextMonday) && isBefore(addDays(nextMonday + 7))) || isBefore(nextSunday)
SOON (isAfter(nextSunday))

-   Event
-   Repeat event
-   Todo

## Potential date helpers

-   lastDayOfISOWeek
-   isThisISOWeek

## Notifications

-   https://developers.google.com/web/fundamentals/primers/service-workers
-   https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

## Implementation details

### Date format

ISO 8601 date format

HTML [datetime-local](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local) input

Start of week: Monday

### Interval format

https://github.com/bmoeskau/Extensible/blob/master/recurrence-overview.md

https://stackoverflow.com/a/10550148

https://stackoverflow.com/q/10545869

Recurrence rule: https://www.rfc-editor.org/rfc/rfc5545#section-3.3.10
