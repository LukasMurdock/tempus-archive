import {
    Link,
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLocation,
    useMatches,
} from 'remix';
import type { MetaFunction } from 'remix';
import tailwind from './styles/app.css';
import classNames from './utils/classNames';

const Navigation = () => {
    const matches = useMatches();
    return (
        <nav className="m-auto max-w-sm pt-4">
            <h1 className="font-bold text-gray-900">Tempus</h1>
            <Link
                to="/events"
                className={classNames(
                    'inline-block rounded-md px-4 py-3 hover:bg-gray-100',
                    matches.filter((match) => match.pathname === '/events') &&
                        'bg-gray-900 text-white hover:text-gray-800'
                )}
            >
                Events
            </Link>
        </nav>
    );
};

export function links() {
    return [{ rel: 'stylesheet', href: tailwind }];
}

export const meta: MetaFunction = () => {
    return { title: 'Tempus' };
};

export default function App() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                <Navigation />
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                {process.env.NODE_ENV === 'development' && <LiveReload />}
            </body>
        </html>
    );
}
