import { Schema, arrayOf } from 'normalizr'

import { ContentTypes, ContentTypesPlural } from '../constants/ContentTypes'

const schemasManager = {}

export default schemasManager

/**
 * Schema object cache, populated in `makeSchemas`.
 * @type {Object}
 */
let schemas

/**
 * Individual schema definitions, defined like this so we can reference one from another.
 * @tpe {Schema}
 */
let categorySchema, mediaSchema, pageSchema, postSchema, revisionSchema, tagSchema, userSchema,
  commentSchema, postTypeSchema, postStatusSchema, taxonomySchema

/**
 * Get the schema object cache.
 * @returns {Object} Schema object cache
 */
schemasManager.getSchemas = function schemasManagerGetSchemas () {
  return schemas
}

/**
 * Create a custom schema definition (for custom content types).
 * @param {String} name Name of the schema
 * @param {String} idAttribute The key of an entity used to identify it
 * @returns {Schema} Schema instance
 */
schemasManager.createSchema = function schemasManagerCreateSchema (name, idAttribute) {
  if (!schemas) {
    throw new Error('createSchema called before schema cache populated, call makeSchemas first.')
  }

  const contentTypeSchema = new Schema(name, { idAttribute })

  contentTypeSchema.define({
    author: userSchema,
    post: postSchema,
    featuredMedia: mediaSchema
  })

  return contentTypeSchema
}

/**
 * Populate the cache of schemas for built-in content types.
 * @param {String} idAttribute The key of an entity used to identify it
 * @returns {Object} Schema cache
 */
schemasManager.init = function schemasManagerInit (idAttribute) {
  if (schemas) return schemas

  // Content types with `id` properties
  categorySchema = new Schema(ContentTypesPlural[ContentTypes.Category], { idAttribute })
  commentSchema = new Schema(ContentTypesPlural[ContentTypes.Comment], { idAttribute })
  mediaSchema = new Schema(ContentTypesPlural[ContentTypes.Media], { idAttribute })
  pageSchema = new Schema(ContentTypesPlural[ContentTypes.Page], { idAttribute })
  postSchema = new Schema(ContentTypesPlural[ContentTypes.Post], { idAttribute })
  revisionSchema = new Schema(ContentTypesPlural[ContentTypes.PostRevision], { idAttribute })
  tagSchema = new Schema(ContentTypesPlural[ContentTypes.Tag], { idAttribute })
  userSchema = new Schema(ContentTypesPlural[ContentTypes.User], { idAttribute })

  // Content types without `id` properties
  postTypeSchema = new Schema(ContentTypesPlural[ContentTypes.PostType], { idAttribute: 'slug' })
  postStatusSchema = new Schema(ContentTypesPlural[ContentTypes.PostStatus], { idAttribute: 'slug' })
  taxonomySchema = new Schema(ContentTypesPlural[ContentTypes.Taxonomy], { idAttribute: 'slug' })

  mediaSchema.define({
    author: userSchema,
    post: postSchema
  })

  pageSchema.define({
    author: userSchema,
    featuredMedia: mediaSchema
  })

  postSchema.define({
    author: userSchema,
    featuredMedia: mediaSchema,
    categories: arrayOf(categorySchema),
    tags: arrayOf(tagSchema)
  })

  schemas = {
    [ContentTypes.Category]: categorySchema,
    [ContentTypes.Comment]: commentSchema,
    [ContentTypes.Media]: mediaSchema,
    [ContentTypes.Page]: pageSchema,
    [ContentTypes.Post]: postSchema,
    [ContentTypes.PostStatus]: postStatusSchema,
    [ContentTypes.PostType]: postTypeSchema,
    [ContentTypes.PostRevision]: revisionSchema,
    [ContentTypes.Tag]: tagSchema,
    [ContentTypes.Taxonomy]: taxonomySchema,
    [ContentTypes.User]: userSchema
  }

  return schemas
}
