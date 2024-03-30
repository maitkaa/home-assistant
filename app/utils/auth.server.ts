//TODO-MAIT fix the any type
export function isAuthorized(request:any): boolean {
    const header = request.headers.get("Authorization");

    if (!header) return false;

    const base64 = header.replace("Basic ", "");
    const [username, password] = Buffer.from(base64, "base64")
        .toString()
        .split(":");
    return username === process.env.USERNAME && password === process.env.PASSWORD;
}