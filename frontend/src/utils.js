// export const validDriveUrlRegex = /^https?:\/\/(drive\.google\.com\/(drive\/folders\/|file\/d\/|open\?id=))[a-zA-Z0-9_-]+
// /

export const validDriveUrlRegex = /^https?:\/\/(drive\.google\.com\/(drive\/folders\/|file\/d\/|open\?id=))[a-zA-Z0-9_-]+/;

export const validDriveUrl = (url) => validDriveUrlRegex.test(url);
