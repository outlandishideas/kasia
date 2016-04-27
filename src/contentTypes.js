import humps from 'humps';
import invariant from 'invariant';

import ContentTypes from './constants/ContentTypes';
import { Slugs, RequestTypes } from './constants/WpApiEndpoints';

const contentTypeNames = Object.keys(ContentTypes);

/**
 * Given a component name, find a corresponding content type.
 * @param {String} targetName
 * @returns {String|undefined}
 */
export function deriveContentType (targetName) {
  for (let i = 0; i < contentTypeNames.length; i++) {
    const contentTypeName = contentTypeNames[i];
    if (targetName.toLowerCase().indexOf(contentTypeName.toLowerCase()) !== -1) {
      return contentTypeName;
    }
  }
}

export function makeCustomContentType (options = {}) {
  options = typeof options === 'string' ? { name: options } : options;

  invariant(
    typeof options.name === 'string',
    'Expecting custom content type name to be a string, got "%s".',
    typeof options.name
  );

  // TODO move this check somewhere that has access to config to prevent custom content types being overridden too
  const builtInContentNames = Object.keys(ContentTypes).map(s => s.toLowerCase());
  const camelisedBuiltInContentNames = builtInContentNames.map(s => s.replace('_', ''));

  const isConflictingName = []
    .concat(builtInContentNames, camelisedBuiltInContentNames)
    .indexOf(options.name.toLowerCase()) !== -1;

  invariant(
    !isConflictingName,
    'The content type name "%s" is taken. Choose another non-conflicting name.',
    options.name
  );

  options.namePlural = options.namePlural || options.name + 's';
  options.requestSlug = options.requestSlug || humps.decamelize(options.namePlural, { separator: '-' });

  return {
    slug: {
      [RequestTypes.SINGLE]: `/${options.requestSlug}/:id`,
      [RequestTypes.PLURAL]: `/${options.requestSlug}`
    },
    name: {
      canonical: options.name,
      [RequestTypes.SINGLE]: humps.camelize(options.name),
      [RequestTypes.PLURAL]: humps.camelize(options.namePlural)
    }
  };
}

/**
 * Build an array of objects describing each built-in content type.
 * @returns {Array}
 */
export function makeContentTypeOptions () {
  return Object.keys(ContentTypes).reduce((obj, contentType) => {
    obj[contentType] = {
      slug: Slugs[contentType],
      name: {
        canonical: contentType,
        [RequestTypes.SINGLE]: mapToCamelCase(contentType),
        [RequestTypes.PLURAL]: mapToCamelCasePlural(contentType)
      }
    };
    return obj;
  }, {});
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
