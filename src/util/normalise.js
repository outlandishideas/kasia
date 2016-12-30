import { normalize, arrayOf } from 'normalizr'
import merge from 'lodash.merge'

import schemasManager from './schemasManager'
import contentTypesManager from './contentTypesManager'

/**
 * Split a response from the WP-API into its constituent entities.
 * @param {Array|Object} response The WP API response
 * @param {String} idAttribute The property name of an entity's identifier
 * @returns {Object}
 */
export default function normalise (response, idAttribute) {
  const schemas = schemasManager.getSchemas() || schemasManager.init(idAttribute)

  return [].concat(response).reduce((entities, entity) => {
    const type = contentTypesManager.derive(entity)

    if (!type) {
      throw new Error(`Could not derive entity type. Entity: ${entity ? JSON.stringify(entity) : typeof entity}`)
    }

    const contentTypeSchema = schemas[type]
      // Built-in content type or previously registered custom content type
      ? schemas[type]
      // Custom content type, will only get here once for each type
      : schemasManager.createSchema(type, idAttribute)

    const schema = Array.isArray(entity)
      ? arrayOf(contentTypeSchema)
      : contentTypeSchema

    const normalised = normalize(entity, schema)

    return merge(entities, normalised.entities)
  }, {})
}
