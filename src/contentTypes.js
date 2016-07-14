import humps from 'humps'
import invariant from 'invariant'

import ContentTypes from './constants/ContentTypes'
import Plurality from './constants/Plurality'
import { Slugs } from './constants/WpApiEndpoints'

export const builtInContentTypeOptions = Object.keys(ContentTypes)
  .reduce((obj, contentType) => {
    obj[contentType] = {
      slug: Slugs[contentType],
      name: {
        canonical: contentType,
        [Plurality.SINGULAR]: mapToCamelCaseSingular(contentType),
        [Plurality.PLURAL]: mapToCamelCasePlural(contentType)
      }
    }
    return obj
  }, {})

export function makeCustomContentTypeOptions (customContentTypes) {
  return customContentTypes
    .reduce((obj, contentType) => {
      const contentTypeOptions = makeCustomContentType(contentType)
      obj[contentTypeOptions.name.canonical] = contentTypeOptions
      return obj
    }, {})
}

export function deriveContentTypeOptions (str, contentTypes) {
  const contentTypeNames = Object.keys(contentTypes)
  const lowercased = str.toLowerCase()

  let contentTypeOptions = false

  contentTypeNames.forEach(function it (name) {
    if (!contentTypeOptions) {
      const nameCanonical = contentTypes[name].name.canonical.toLowerCase()
      if (lowercased.indexOf(nameCanonical) !== -1) {
        contentTypeOptions = contentTypes[name]
      }
    }
  })

  return contentTypeOptions
}

function makePlural (str) {
  return str[str.length - 1] === 's' ? str : str + 's'
}

function makeCustomContentType (options) {
  invariant(
    typeof options === 'string' || typeof options.name === 'string',
    'Expecting custom content type name to be a string, got "%s".',
    typeof (options.name ? options.name : options)
  )

  options = typeof options === 'string'
    ? { name: String(options) }
    : options

  options.nameSingle = options.nameSingle || options.name
  options.namePlural = options.namePlural || makePlural(options.name)
  options.requestSlug = options.requestSlug || humps.decamelize(options.namePlural, { separator: '-' })

  const builtInContentNames = Object.keys(ContentTypes)
    .map((s) => s.toLowerCase())

  const camelisedBuiltInContentNames = builtInContentNames
    .map((s) => s.replace('_', ''))

  const isConflictingName = []
      .concat(builtInContentNames, camelisedBuiltInContentNames)
      .indexOf(options.name.toLowerCase()) !== -1

  invariant(
    !isConflictingName,
    'The content type name "%s" is taken. ' +
    'Choose another non-conflicting name.',
    options.name
  )

  return {
    isCustomContentType: true,
    slug: {
      [Plurality.SINGULAR]: `/${options.requestSlug}/:id`,
      [Plurality.PLURAL]: `/${options.requestSlug}`
    },
    name: {
      // Canonical name is used when querying content types
      canonical: options.name,
      // Singular is used for placing an item on a component's props, e.g. `this.props.postType`
      [Plurality.SINGULAR]: humps.camelize(options.nameSingle),
      // Plural is used for entity collection name in the store, e.g. `store.wordpress.entities.postTypes`
      [Plurality.PLURAL]: humps.camelize(options.namePlural)
    }
  }
}

function mapToCamelCaseSingular (contentType) {
  return {
    [ContentTypes.CATEGORY]: 'category',
    [ContentTypes.COMMENT]: 'comment',
    [ContentTypes.MEDIA]: 'media',
    [ContentTypes.PAGE]: 'page',
    [ContentTypes.POST]: 'post',
    [ContentTypes.POST_REVISION]: 'postRevision',
    [ContentTypes.POST_TYPE]: 'postType',
    [ContentTypes.POST_STATUS]: 'postStatus',
    [ContentTypes.TAG]: 'tag',
    [ContentTypes.TAXONOMY]: 'taxonomy',
    [ContentTypes.USER]: 'user'
  }[contentType]
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
  }[contentType]
}
