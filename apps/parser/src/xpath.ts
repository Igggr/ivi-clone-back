export const titleXpath =
  '//div[starts-with(@class, "styles_title")]/h1[starts-with(@class, "styles_title")]/span';
export const origTitleXpath =
  '//span[starts-with(@class, "styles_originalTitle")]';
export const genreXpath = '//a[starts-with(@href, "/lists/movies/genre--")]';
export const countryXpath = '//a[starts-with(@href, "/lists/movies/country")]';

// DOM состоит просто из мусора. Ни id, ни внятных классов. В принципе можно зацепиться за содержание элемента === 'Слоган'
// Но цепляться за содержимое тега это кажется еще больший треш.
export const sloganXpath =
  '//*[@id="__next"]/div[2]/div[2]/div[2]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div[4]/div[2]/div/text()';
export const timeXpath =
  '//*[@id="__next"]/div[2]/div[2]/div[2]/div[2]/div/div[3]/div/div/div[2]/div[1]/div/div[23]/div[2]/div';

// часть td - просто разделители. Этот спуск, а потом подъем в родимтеля нужен для фильтарция
export const premierXpath =
  '//*[@id="block_left"]/div/table/tbody/tr[2]/td/table/tbody/tr/td/a/parent::td/parent::tr';

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
