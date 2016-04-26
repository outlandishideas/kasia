import humps from 'humps';
import invariant from 'invariant';

import ContentTypes from './constants/ContentTypes';

const contentTypeOptions = {};

const contentTypeNames = Object.keys(ContentTypes);

const contentTypeNamesCamelCase = Object.keys(ContentTypes)
  .map(humps.camelize);

function contentNameTaken(name) {
  return []
    .concat(contentTypeNames, contentTypeNamesCamelCase)
    .includes(name);
}

export const customContentTypes = {};

export function registerCustomContentType (name, {
  namePlural = null,
  requestSlug = null
} = {}) {
  invariant(
    typeof name === 'string',
    'Expecting name of custom content type to be a string.'
  );

  invariant(
    !contentNameTaken(name),
    'The content type "%s" is already taken. ' +
    'Choose another non-conflicting name.',
    name
  );

  namePlural = namePlural || name + 's';
  requestSlug = requestSlug || humps.decamelize(namePlural, { separator: '-' });

  return customContentTypes[name] = {
    name,
    namePlural,
    requestSlug
  };
}

export function deriveContentType (targetName) {
  for (let i = 0; i < contentTypeNames.length; i++) {
    const contentTypeName = contentTypeNames[i];
    if (targetName.toLowerCase().indexOf(contentTypeName.toLowerCase()) !== -1) {
      return contentTypeName;
    }
  }
}

export function makeContentTypeOptions (contentType) {
  if (contentTypeOptions[contentType]) {
    return contentTypeOptions[contentType];
  }

  return contentTypeOptions[contentType] = {
    name: mapToCamelCase(contentType),
    namePlural: mapToCamelCasePlural(contentType)
  };
}

function mapToCamelCase (contentType) {
  return {
    [ContentTypes.CATEGORY]: 'category',
    [ContentTypes.COMMENT]: 'comment',
    [ContentTypes.MEDIA]: 'media',
    [ContentTypes.PAGE]: 'page',
    [ContentTypes.POST]: 'post',
    [ContentTypes.POST_REVISION]: 'postRevision',
    [ContentTypes.POST_TYPE]: 'postType',
    [ContentTypes.POST_STATUS]: 'postStatuses',
    [ContentTypes.TAG]: 'tag',
    [ContentTypes.TAXONOMY]: 'taxonomy',
    [ContentTypes.USER]: 'user'
  }[contentType];
}

function mapToCamelCasePlural (contentType) {
  return {
    [ContentTypes.CATEGORY]: 'categories',
    [ContentTypes.COMMENT]: 'comments',
    [ContentTypes.MEDIA]: 'media',
    [ContentTypes.PAGE]: 'pages',
    [ContentTypes.POST]: 'posts',
    [ContentTypes.POST_REVISION]: 'postRevisions',
    [ContentTypes.POST_TYPE]: 'postTypes',
    [ContentTypes.POST_STATUS]: 'postStatuses',
    [ContentTypes.TAG]: 'tags',
    [ContentTypes.TAXONOMY]: 'taxonomies',
    [ContentTypes.USER]: 'users'
  }[contentType];
}
