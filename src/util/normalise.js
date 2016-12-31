import { normalize, arrayOf } from 'normalizr'
import merge from 'lodash.merge'

import schemasManager from './schemasManager'
import contentTypesManager from './contentTypesManager'

/** Split a response from the WP-API into its constituent entities. */
export default function normalise (response, idAttribute) {
  const schemas = schemasManager.getAll() || schemasManager.init(idAttribute)

  return [].concat(response).reduce((entities, entity) => {
    const type = contentTypesManager.derive(entity)

    if (!type) {
      console.log(
        `[kasia] could not derive entity type - ignoring.`,
        `Entity: ${entity ? JSON.stringify(entity) : typeof entity}`
      )
      return entities
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
