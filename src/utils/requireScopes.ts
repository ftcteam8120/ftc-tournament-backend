import * as _ from 'lodash';

export function requireScopes(userScopes: string, ...requiredScopes: string[]) {
  let scopes = userScopes.split(' ');
  let foundScopes = [];
  for (let i = 0; i < requiredScopes.length; i++) {
    if (userScopes.indexOf(requiredScopes[i]) > -1) foundScopes.push(requiredScopes[i]);
  }
  let missing = _.difference(requiredScopes, foundScopes);
  if (foundScopes.length != requiredScopes.length) {
    let missingString = "";
    for (const scope in missing) {
      missingString += scope + ' ';
    }
    return false;
  }
  return true;
}