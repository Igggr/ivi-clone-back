export const minAgeXpath =
  '//div[text()="Возраст"]//following-sibling::div/a[starts-with(@class, "styles_restrictionLink")]/span';
export const MPAA_Link =
  '//div[text()="Рейтинг MPAA"]//following-sibling::div/a[starts-with(@class, "styles_restrictionLink")]';
export const restrictionAbbrivaitaionXpath = `${MPAA_Link}/span[not (starts-with(@class, "styles_restrictionDescription"))]`;
export const restrictionShortDescriptionXpath = `${MPAA_Link}/span[starts-with(@class, "styles_restrictionDescription")]`;
export const restrictionFullDescriptionXpath =
  '//img[starts-with(@alt, "Рейтинг")]/parent::td/parent::tr/following-sibling::tr/td[@class="news"]';
