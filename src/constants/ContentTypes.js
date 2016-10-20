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
  [ContentTypes.Post]: 'posts',
  [ContentTypes.PostStatus]: 'statuses',
  [ContentTypes.PostType]: 'types',
  [ContentTypes.PostRevision]: 'revisions',
  [ContentTypes.Tag]: 'tags',
  [ContentTypes.Taxonomy]: 'taxonomies',
  [ContentTypes.User]: 'users'
}

/**
 * These content types do not have `id` properties.
 * @type {Array}
 */
export const ContentTypesWithoutId = [
  ContentTypesPlural[ContentTypes.Category],
  ContentTypesPlural[ContentTypes.PostType],
  ContentTypesPlural[ContentTypes.PostStatus],
  ContentTypesPlural[ContentTypes.Taxonomy]
]
