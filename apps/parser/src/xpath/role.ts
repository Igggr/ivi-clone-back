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
