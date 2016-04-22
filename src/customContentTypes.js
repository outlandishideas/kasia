import humps from 'humps';

import ContentTypes from './constants/ContentTypes';

const contentTypeNames = Object.keys(ContentTypes)
  .map((name) => humps.camelize(name));

export const customContentTypes = {};

export function registerCustomContentType (name, {
  namePlural = null,
  requestSlug = null
} = {}) {
  if (typeof name !== 'string') {
    throw new Error('Expecting name of Custom Content Type to be a string.');
  }

  const contentTypeNameTaken = Object.keys(customContentTypes).includes(name) ||
    contentTypeNames.includes(name);

  if (contentTypeNameTaken) {
    throw new Error(
      `The Content Type name "${name}" is already taken. ` +
      `Choose another non-conflicting name.`
    );
  }

  namePlural = namePlural || name + 's';
  requestSlug = requestSlug || humps.decamelize(namePlural, { separator: '-' });

  return customContentTypes[name] = {
    name,
    namePlural,
    requestSlug
  };
}
