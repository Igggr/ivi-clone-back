export const titleXpath =
  '//div[starts-with(@class, "styles_title")]/h1[starts-with(@class, "styles_title")]/span';
export const origTitleXpath =
  '//span[starts-with(@class, "styles_originalTitle")]';
export const genreXpath =
  '//a[starts-with(@href, "/lists/movies/genre--")]/parent::*';
export const countryXpath = '//a[starts-with(@href, "/lists/movies/country")]';

// DOM состоит просто из мусора. Ни id, ни внятных классов.
// Цепляться за контент, это треш.
// Но хpathб которые не цепляется за контент
// '//*[@id="__next"]/div[2]/div[2]/div[2]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div[23]/div[2]/div'
// настолько хрупок, что ломается при переходе от страницы одного фильма к странице другого
// Почему неясно. По идее они должны генерироватьь эти страницы одним и тем же кодом
// и страницы могут различаться по структуре толок между фильмами / мультиками / сериалами
// Но структура отличается и просто между 2 фильмами
export const sloganXpath = '//div[text()="Слоган"]/following-sibling::div';
export const timeXpath = '//div[text()="Время"]/following-sibling::div';
export const premierXpath =
  '//a[starts-with(@href, "/lists/m_act[country]")]//parent::td/parent::tr';
