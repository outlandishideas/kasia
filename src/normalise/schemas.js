import { Schema, arrayOf } from 'normalizr'

import { ContentTypes } from '../contentTypes'

let schemas = null

let categorySchema, mediaSchema, pageSchema, postSchema, revisionSchema, tagSchema, userSchema,
  commentSchema, postTypeSchema, postStatusSchema, taxonomySchema;

export function createSchema (name, idAttributeKey) {
  const contentTypeSchema = new Schema(name, {
    idAttribute: idAttributeKey.toLowerCase()
  })

  contentTypeSchema.define({
    author: userSchema,
    post: postSchema,
    embedded: {
      author: arrayOf(userSchema)
    }
  })

  return contentTypeSchema
}

export function makeSchemas (idAttributeKey, invalidateCache) {
  if (schemas && !invalidateCache) {
    return schemas
  }

  const options = {
    idAttribute: idAttributeKey.toLowerCase()
  }

  // Content types with `id` properties
  categorySchema = new Schema('categories', options)
  mediaSchema = new Schema('media', options)
  pageSchema = new Schema('pages', options)
  postSchema = new Schema('posts', options)
  revisionSchema = new Schema('revisions', options)
  tagSchema = new Schema('tags', options)
  userSchema = new Schema('users', options)

  // Content types without `id` properties
  commentSchema = new Schema('comments', { idAttribute: 'slug' })
  postTypeSchema = new Schema('postTypes', { idAttribute: 'slug' })
  postStatusSchema = new Schema('postStatuses', { idAttribute: 'slug' })
  taxonomySchema = new Schema('taxonomies', { idAttribute: 'slug' })

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
