import { Schema, arrayOf } from 'normalizr'

import ContentTypes from '../constants/ContentTypes'

let schemas = null

export default function makeSchemas (idAttributeKey, invalidateCache) {
  if (schemas && !invalidateCache) {
    return schemas
  }

  const options = {
    idAttribute: idAttributeKey.toLowerCase()
  }

  // Content types with `id` properties
  const categorySchema = new Schema('categories', options)
  const mediaSchema = new Schema('media', options)
  const pageSchema = new Schema('pages', options)
  const postSchema = new Schema('posts', options)
  const revisionSchema = new Schema('revisions', options)
  const tagSchema = new Schema('tags', options)
  const userSchema = new Schema('users', options)

  // Content types without `id` properties
  const commentSchema = new Schema('comments', { idAttribute: 'slug' })
  const postTypeSchema = new Schema('postTypes', { idAttribute: 'slug' })
  const postStatusSchema = new Schema('postStatuses', { idAttribute: 'slug' })
  const taxonomySchema = new Schema('taxonomies', { idAttribute: 'slug' })

  mediaSchema.define({
    author: userSchema,
    post: postSchema,
    embedded: {
      author: arrayOf(userSchema)
    }
  })

  pageSchema.define({
    author: userSchema,
    featuredMedia: mediaSchema,
    embedded: {
      author: arrayOf(userSchema),
      'wp:featuredmedia': arrayOf(mediaSchema)
    }
  })

  postSchema.define({
    author: userSchema,
    featuredMedia: mediaSchema,
    categories: arrayOf(categorySchema),
    tags: arrayOf(tagSchema),
    embedded: {
      author: arrayOf(userSchema),
      'wp:featuredmedia': arrayOf(mediaSchema)
    }
  })

  schemas = {
    [ContentTypes.CATEGORY]: categorySchema,
    [ContentTypes.COMMENT]: commentSchema,
    [ContentTypes.MEDIA]: mediaSchema,
    [ContentTypes.PAGE]: pageSchema,
    [ContentTypes.POST]: postSchema,
    [ContentTypes.POST_STATUS]: postStatusSchema,
    [ContentTypes.POST_TYPE]: postTypeSchema,
    [ContentTypes.POST_REVISION]: revisionSchema,
    [ContentTypes.TAG]: tagSchema,
    [ContentTypes.TAXONOMY]: taxonomySchema,
    [ContentTypes.USER]: userSchema
  }

  return schemas
}
