# Countdown Calendar


```typescript
type EventSchema = {
    title: string;
    start: string;
    end: string;
    date: string;
    isRecurring: boolean;
}
```

Add event
<input type="text" name="title"> Title
<input type="datetime-local"> Day and start time
<input type="time"> End time


Options:
- Recurring (interval)? <input type="radio"> Daily | Weekly | Monthly | Yearly
- Interval period? <fieldset><input type="checkbox">M T W T F S S
- Interval end? <input type="checkbox">Endlessly | <input type="date">Til
- Location? <input type="text" name="location">
- Notifications?


NOW if not weekend => isThisWeek, else => today till next week
02/11   ECO 202 Ch. 5 Prep     1d 15h 11m
WEEKEND (isWeekend)
NEXT WEEK (isAfter(nextMonday) && isBefore(addDays(nextMonday + 7))) || isBefore(nextSunday)
SOON (isAfter(nextSunday))


- Event
- Repeat event
- Todo


## Potential date helpers
- lastDayOfISOWeek
- isThisISOWeek


## Notifications
- https://developers.google.com/web/fundamentals/primers/service-workers
- https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

## Implementation details

### Date format
ISO 8601 date format

HTML [datetime-local](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local) input

Start of week: Monday


### Interval format

https://github.com/bmoeskau/Extensible/blob/master/recurrence-overview.md

https://stackoverflow.com/a/10550148

https://stackoverflow.com/q/10545869
