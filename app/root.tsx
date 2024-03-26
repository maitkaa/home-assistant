import {
    Links, LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration, useLoaderData,
} from "@remix-run/react";
import styles from "./globals.css?url";
import clsx from "clsx"
import {PreventFlashOnWrongTheme, ThemeProvider, useTheme} from "remix-themes"

import {LoaderFunctionArgs} from '@remix-run/node';
import {themeSessionResolver} from './utils/sessions.server';

export const links = () => {
    return [{rel: "stylesheet", href: styles}];
};

// Return the theme from the session storage using the loader
export async function loader({request}: LoaderFunctionArgs) {
    const {getTheme} = await themeSessionResolver(request)
    return {
        theme: getTheme(),
    }
}

// Wrap your app with ThemeProvider.
// `specifiedTheme` is the stored theme in the session storage.
// `themeAction` is the action name that's used to change the theme in the session storage.
export default function AppWithProviders() {
    const data = useLoaderData<typeof loader>()
    return (
        <ThemeProvider specifiedTheme={data.theme} themeAction="/action/set-theme">
            <App/>
        </ThemeProvider>
    )
}

export function App() {
    const data = useLoaderData<typeof loader>()
    const [theme] = useTheme()
    return (
        <html lang="en" className={clsx(theme)}>
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)}/>
            <Links/>
        </head>
        <body>
        <Outlet/>
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    )
}
