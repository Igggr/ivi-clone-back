export const previewPageXPath = (film: number) =>
  `//div[starts-with(@class, "film-trailer")]/a[starts-with(@href, "/film/${film}/video") and starts-with(text(), "Трейлер")]`;
export const previewElement =
  '//div[@class="js-discovery-trailer movie-trailer-embed"]/div[contains(@class, "kinopoisk-widget-embed")]';
export const previewFrame = (film: number) =>
  `//iframe[starts-with(@src, "https://widgets.kinopoisk.ru/discovery/film/${film}/trailer")]`;
