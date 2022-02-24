import {
    deleteEventById,
    getEventById,
    getEventByTitle,
} from '~/utils/db.events';
import { ActionFunction, Form, LoaderFunction } from 'remix';
import { Link, useLoaderData, redirect } from 'remix';
import type { Event } from '@prisma/client';
import { db } from '~/utils/db.server';
import { XIcon } from '@heroicons/react/solid';

type LoaderData = { event: Event };
export const loader: LoaderFunction = async ({ params }) => {
    if (!params.eventId) return redirect('/events');
    // const event = await getEventById(params.eventId);
    const event = await getEventById(params.eventId);
    // Maybe handle this with a message?
    if (!event) return redirect('/events');
    const data: LoaderData = { event };
    return data;
};

export let action: ActionFunction = async ({ request }) => {
    let formData = await request.formData();
    // let { _action, id } = Object.fromEntries(formData);
    let _action = formData.get('_action');
    let id = formData.get('id');

    if (!_action || !id) return null;

    if (_action === 'create') {
    }

    if (_action === 'delete' && id) {
        const data = await deleteEventById(String(id));
        // console.log(data);
        return data;
    }
};

export default function EventRoute() {
    const { event } = useLoaderData<LoaderData>();
    return (
        <div>
            <h1>{event.title}</h1>
            <div className="prose">
                <pre>{JSON.stringify(event, null, 2)}</pre>
            </div>
            <p>{event.start}</p>
            <p>{event.end}</p>
            <p>{event.duration}</p>
            <Link to=".">{event.title} Permalink</Link>
            <Form method="post">
                <input type="hidden" id="id" name="id" value={event.id} />
                <button
                    type="submit"
                    name="_action"
                    value="delete"
                    className="rounded-full bg-gray-100 p-3"
                >
                    <XIcon className="h-5 w-5" />
                </button>
            </Form>
        </div>
    );
}
