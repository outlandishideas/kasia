import { normalize, arrayOf } from 'normalizr'
import modifyResponse from 'wp-api-response-modify'

import schemasManager from './schemasManager'
import contentTypesManager from '../util/contentTypesManager'

/**
 * Split a response from the WP-API into its constituent entities.
 * @param {Array} data The WP API response data
 * @param {String} idAttribute The property name of an entity's identifier
 * @returns {Object}
 */
export default function normalise (data, idAttribute) {
  let schemas = schemasManager.getSchemas()

  if (!schemas) {
    schemas = schemasManager.init(idAttribute)
  }

  return data.reduce((entities, rawEntity) => {
    const entity = modifyResponse(rawEntity)
    const type = contentTypesManager.derive(entity)

    const contentTypeSchema = schemas[type]
      // Built-in content type or previously registered custom content type
      ? schemas[type]
      // Custom content type, will only get here once for each type
      : schemasManager.createSchema(type, idAttribute)

    const schema = Array.isArray(entity)
      ? arrayOf(contentTypeSchema)
      : contentTypeSchema

    const normalised = normalize(entity, schema)

    return Object.assign({}, entities, normalised.entities)
  }, {})
}
