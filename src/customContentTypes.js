import humps from 'humps';
import invariant from 'invariant';

import ContentTypes from './constants/ContentTypes';

const contentTypeNames = Object.keys(ContentTypes)
  .map((name) => humps.camelize(name));

export const customContentTypes = {};

export function registerCustomContentType (name, {
  namePlural = null,
  requestSlug = null
} = {}) {
  invariant(
    typeof name === 'string',
    'Expecting name of Custom Content Type to be a string.'
  );

  const contentTypeNameTaken = Object.keys(customContentTypes).includes(name) ||
    contentTypeNames.includes(name);

  invariant(
    !contentTypeNameTaken,
    `The Content Type name "${name}" is already taken. ` +
    `Choose another non-conflicting name.`
  );

  namePlural = namePlural || name + 's';
  requestSlug = requestSlug || humps.decamelize(namePlural, { separator: '-' });

  return customContentTypes[name] = {
    name,
    namePlural,
    requestSlug
  };
}
