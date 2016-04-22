import humps from 'humps';

import ContentTypes from './constants/ContentTypes';

const contentTypeNames = Object.keys(ContentTypes)
  .map((name) => humps.camelize(name));

function makePluralContentTypeName (name) {
  return name[name.length - 1] === 'y'
    ? name.substr(0, name.length - 1) + 'ies'
    : name + 's'
}

export const customContentTypes = {};

export function registerCustomContentType (name, {
  namePlural = null,
  requestSlug = null
} = {}) {
  if (typeof name !== 'string') {
    throw new Error('Expecting name of Custom Content Type to be a string.');
  }

  if (contentTypeNames.includes(name.toLowerCase())) {
    throw new Error(
      `The Content Type name "${name}" is already taken by a built-in. ` +
      `Choose another non-conflicting name.`
    );
  }

  namePlural = namePlural || makePluralContentTypeName(name);
  requestSlug = requestSlug || humps.decamelize(name.toLowerCase(), { split: /_/, separator: '-' });

  return customContentTypes[name] = {
    name,
    namePlural,
    requestSlug
  };
}
