export const titleXpath =
  '//div[starts-with(@class, "styles_title")]/h1[starts-with(@class, "styles_title")]/span';
export const origTitleXpath =
  '//span[starts-with(@class, "styles_originalTitle")]';
export const genreXpath = '//a[starts-with(@href, "/lists/movies/genre--")]';
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

type Role =
  | 'director'
  | 'actor'
  | 'producer'
  | 'voice_director'
  | 'translator'
  | 'voice'
  | 'writer'
  | 'operator'
  | 'composer'
  | 'design'
  | 'editor';

export const directorsXpath = xpathBeetweenRoles('director', 'actor');
export const actorsXpath = xpathBeetweenRoles('actor', 'producer');
export const producersXpath = xpathBeetweenRoles('producer', 'voice_director');
export const voiceDirectorsXpath = xpathBeetweenRoles(
  'voice_director',
  'translator',
);
export const translatorsXpath = xpathBeetweenRoles('translator', 'voice');
export const voicesXpath = xpathBeetweenRoles('voice', 'writer');
export const writersXpath = xpathBeetweenRoles('writer', 'operator');
export const operatorsXpath = xpathBeetweenRoles('operator', 'composer');
export const composersXpath = xpathBeetweenRoles('composer', 'design');
export const designersXpath = xpathBeetweenRoles('design', 'editor');
export const editorsXpath =
  '//a[@name="editor"]/following-sibling::div//div[@class="actorInfo"]';

function xpathBetween(tagBefore: string, tagAfter: string): string {
  return `[preceding-sibling::${tagBefore} and not(preceding-sibling::${tagAfter})]`;
}

function xpathBeetweenRoles(roleFrom: Role, roleTo: Role) {
  const tagBefore = `a[@name="${roleFrom}"]`;
  const tagAfter = `a[@name="${roleTo}"]`;

  return `//div${xpathBetween(tagBefore, tagAfter)}//div[@class="actorInfo"]`;
}
