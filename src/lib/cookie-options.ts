// Options for the login cookie, shared by the browser, server, and proxy
// clients so all three write the cookie the same way.
//
// secure: the browser sends the cookie only over HTTPS. Turned on in the
// built app (Vercel is HTTPS only) and off in `npm run dev`, which runs on
// plain http://localhost.
//
// The cookie is not HttpOnly: the browser parts of the app (uploads, the
// calendar) read the login from it, which is how Supabase's SSR library is
// designed. Blocking XSS (React escapes text, no raw HTML anywhere) is what
// protects it.
export const sessionCookieOptions = {
  secure: process.env.NODE_ENV === "production",
};
