import { normalize, arrayOf } from 'normalizr'
import merge from 'lodash.merge'
import modifyResponse from 'wp-api-response-modify'

import { makeSchemas, createSchema } from './schemas'
import { deriveContentType } from '../util/contentTypes'

/**
 * Split a response from the WP-API into its constituent entities.
 * @param {Array} data The WP API response data
 * @param {String} idAttribute The property name of an entity's identifier
 * @returns {Object}
 */
export default function normalise (data, idAttribute) {
  const schemas = makeSchemas(idAttribute)

  return data.reduce((entities, rawEntity) => {
    const entity = modifyResponse(rawEntity)
    const type = deriveContentType(entity)

    const contentTypeSchema = schemas[type]
      // Built-in content type or previously registered custom content type
      ? schemas[type]
      // Custom content type, will only get here once for each type
      : createSchema(type, idAttribute)

    const schema = Array.isArray(entity)
      ? arrayOf(contentTypeSchema)
      : contentTypeSchema

    const normalised = normalize(entity, schema)

    return merge({}, entities, normalised.entities)
  }, {})
}
