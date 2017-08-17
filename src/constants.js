// WP-API namespace (`wp-json/${namespace}`)
export const WpApiNamespace = 'wp/v2'

export const ActionTypes = {
  // Initiate a request to the WP API
  RequestCreatePost: 'kasia/REQUEST_CREATE_POST',
  RequestCreateQuery: 'kasia/REQUEST_CREATE_QUERY',
  // Place record of a request in the store
  RequestAck: 'kasia/REQUEST_ACK',
  // Place the result of a request on the store
  RequestComplete: 'kasia/REQUEST_COMPLETE',
  // Record the failure of a request on the store
  RequestFail: 'kasia/REQUEST_FAILED'
}

// The built-in content types available in WordPress.
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

// Plural names of the built-in content types. These are used in determining the
// wpapi method to call when fetching a content type's respective data.
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

// These content types do not have `id` properties.
export const ContentTypesWithoutId = [
  ContentTypes.Category,
  ContentTypes.PostType,
  ContentTypes.PostStatus,
  ContentTypes.Taxonomy
]
