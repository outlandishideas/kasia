const ContentTypes = {
  CATEGORY: 'CATEGORY',
  COMMENT: 'COMMENT',
  MEDIA: 'MEDIA',
  PAGE: 'PAGE',
  POST: 'POST',
  POST_REVISION: 'POST_REVISION',
  POST_TYPE: 'POST_TYPE',
  POST_STATUS: 'POST_STATUS',
  TAG: 'TAG',
  TAXONOMY: 'TAXONOMY',
  USER: 'USER'
}

export const QueryableBySlug = [
  ContentTypes.CATEGORY,
  ContentTypes.MEDIA,
  ContentTypes.PAGE,
  ContentTypes.POST,
  ContentTypes.TAG,
  ContentTypes.USER
]

// Export each individually for convenience
export const Category = ContentTypes.CATEGORY
export const Comment = ContentTypes.COMMENT
export const Media = ContentTypes.MEDIA
export const Page = ContentTypes.PAGE
export const Post = ContentTypes.POST
export const PostRevision = ContentTypes.POST_REVISION
export const PostType = ContentTypes.POST_TYPE
export const PostStatus = ContentTypes.POST_STATUS
export const Tag = ContentTypes.TAG
export const Taxonomy = ContentTypes.TAXONOMY
export const User = ContentTypes.USER

export default ContentTypes
