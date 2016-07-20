import values from 'lodash.values'
import { camelizeKeys } from 'humps'

/**
 * The built-in content types available in WordPress.
 * @type {Object}
 */
export const ContentTypes = {
  Category: 'category',
  Comment: 'comment',
  Media: 'media',
  Page: 'page',
  Post: 'post',
  PostStatus: 'status',
  PostType: 'type',
  PostRevision: 'revision',
  Tag: 'tag',
  Taxonomy: 'taxonomy',
  User: 'user'
}

/**
 * Plural names of the built-in content types. These are used in determining the
 * node-wpapi method to call when fetching a content type's respective data.
 * @type {Object}
 */
export const ContentTypesPlural = {
  [ContentTypes.Category]: 'categories',
  [ContentTypes.Comment]: 'comments',
  [ContentTypes.Media]: 'media',
  [ContentTypes.Page]: 'pages',
  [ContentTypes.Single]: 'posts',
  [ContentTypes.PostStatus]: 'statuses',
  [ContentTypes.PostType]: 'types',
  [ContentTypes.PostRevision]: 'revisions',
  [ContentTypes.Tag]: 'tags',
  [ContentTypes.Taxonomy]: 'taxonomies',
  [ContentTypes.User]: 'users'
}

const makeBuiltInContentTypeOptions = (name) => ({
  name,
  plural: ContentTypesPlural[name],
  slug: ContentTypesPlural[name]
})

// Pre-populate cache with built-in content type options
const optionsCache = values(ContentTypes).reduce((cache, name) => {
  cache[name] = makeBuiltInContentTypeOptions(name)
  return cache
}, {})

/**
 * Create and set the options object for a content type in the cache.
 * @param {String} options Content type options oject
 * @returns {Object}
 */
export function registerContentType (options) {
  optionsCache[options.name] = options
}

/**
 * Get the options for a content type.
 * @param {String} contentType The name of the content type
 * @returns {Object}
 */
export function getContentType (contentType) {
  return optionsCache[contentType]
}

/**
 * Get all registered content types and their options.
 * @returns {Object}
 */
export function getContentTypes () {
  return optionsCache
}
