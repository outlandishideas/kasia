import humps from 'humps';
import invariant from 'invariant';

import ContentTypes from './constants/ContentTypes';
import Plurality from './constants/Plurality';
import { Slugs } from './constants/WpApiEndpoints';

export function makeBuiltInContentTypeOptions () {
  return Object.keys(ContentTypes).reduce((obj, contentType) => {
    obj[contentType] = {
      slug: Slugs[contentType],
      name: {
        canonical: contentType,
        [Plurality.SINGULAR]: humps.camelize(contentType.toLowerCase()),
        [Plurality.PLURAL]: mapToCamelCasePlural(contentType)
      }
    };
    return obj;
  }, {});
}

export function makeCustomContentTypeOptions (customContentTypes) {
  return customContentTypes.reduce((obj, contentType) => {
    const options = typeof contentType === 'string' ? { name: contentType } : contentType;
    const contentTypeOptions = makeCustomContentType(options);
    obj[contentTypeOptions.name.canonical] = contentTypeOptions;
    return obj;
  }, {});
}

export function findContentTypeOptions (contentTypeName, contentTypes) {
  const contentTypeNames = Object.keys(contentTypes);

  for (let i = 0; i < contentTypeNames.length; i++) {
    const name = contentTypeNames[i];
    const options = contentTypes[name];

    if (options.name.canonical === contentTypeName) {
      return options;
    }
  }
}

export function deriveContentTypeOptions (str, contentTypes) {
  const contentTypeNames = Object.keys(contentTypes);
  const lowercased = str.toLowerCase();

  let found;

  for (let i = 0; i < contentTypeNames.length; i++) {
    const name = contentTypeNames[i];
    const options = contentTypes[name];

    if (lowercased.indexOf(options.name.canonical.toLowerCase()) !== -1) {
      found = contentTypes[name];
      break;
    }
  }

  invariant(
    found,
    'Could not derive content type from name "%s". ' +
    'Pass built-ins using Pepperoni.ContentTypes. For example, ContentTypes.POST. ' +
    'Custom content types should be registered at initialisation and passed in using registered name.',
    str
  );

  return found;
}

function makeCustomContentType (options = {}) {
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
      [Plurality.SINGULAR]: `/${options.requestSlug}/:id`,
      [Plurality.PLURAL]: `/${options.requestSlug}`
    },
    name: {
      // Canonical name is used when querying content types
      canonical: options.name,
      // Single name is used for placing an item on a component's state, e.g. `state.postType`
      [Plurality.SINGULAR]: humps.camelize(options.name),
      // Plural name is used for entity collection name in the store, e.g. `entities.postTypes`
      [Plurality.PLURAL]: humps.camelize(options.namePlural)
    }
  };
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
