import { Schema, arrayOf } from 'normalizr'

import { ContentTypes, ContentTypesPlural as plural } from '../contentTypes'

/**
 * Schema object cache, populated in `makeSchemas`
 * @type {Object}
 */
let schemas

/**
 * Individual schema definitions, defined like this so we can reference one from another
 * @tpe {Schema}
 */
let categorySchema, mediaSchema, pageSchema, postSchema, revisionSchema, tagSchema, userSchema,
  commentSchema, postTypeSchema, postStatusSchema, taxonomySchema

/**
 * The last value passed as the `idAttribute` on calling `makeSchemas`.
 * This is here so that it is possible to clear and re-populate the schema cache during tests.
 * @type {String}
 */
let lastIdAttribute

/**
 * Create a custom schema definition (for custom content types).
 * @param {String} name Name of the schema
 * @param {String} idAttribute The key of an entity used to identify it
 * @returns {Schema} Schema instance
 */
export function createSchema (name, idAttribute) {
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
export function makeSchemas (idAttribute) {
  if (schemas && lastIdAttribute === idAttribute) {
    return schemas
  }

  lastIdAttribute = idAttribute

  // Content types with `id` properties
  categorySchema = new Schema(plural[ContentTypes.Category], { idAttribute })
  commentSchema = new Schema(plural[ContentTypes.Comment], { idAttribute })
  mediaSchema = new Schema(plural[ContentTypes.Media], { idAttribute })
  pageSchema = new Schema(plural[ContentTypes.Page], { idAttribute })
  postSchema = new Schema(plural[ContentTypes.Post], { idAttribute })
  revisionSchema = new Schema(plural[ContentTypes.PostRevision], { idAttribute })
  tagSchema = new Schema(plural[ContentTypes.Tag], { idAttribute })
  userSchema = new Schema(plural[ContentTypes.User], { idAttribute })

  // Content types without `id` properties
  postTypeSchema = new Schema(plural[ContentTypes.PostType], { idAttribute: 'slug' })
  postStatusSchema = new Schema(plural[ContentTypes.PostStatus], { idAttribute: 'slug' })
  taxonomySchema = new Schema(plural[ContentTypes.Taxonomy], { idAttribute: 'slug' })

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
