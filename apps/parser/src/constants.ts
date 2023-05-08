export const DOMEN = 'https://www.kinopoisk.ru';

export const fullUrl = (url: string) =>
  url === null || url === undefined || url.startsWith('http')
    ? url
    : DOMEN + url;

const nbsp = new RegExp(String.fromCharCode(160), 'gi');

export function replaceNbsp(textContent: string) {
  return textContent.replace(nbsp, ' ');
}
