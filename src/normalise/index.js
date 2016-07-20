import { normalize, Schema, arrayOf } from 'normalizr'
import { camelizeKeys } from 'humps'

import { makeSchemas, createSchema } from './schemas'
import flatten from './flatten'

export default function normalise (contentTypeOptions, content, idAttribute, invalidateSchemaCache = false) {
  const flattened = flatten(camelizeKeys(content))

  const finalIdAttribute = typeof idAttribute === 'function'
    ? idAttribute(flattened)
    : idAttribute

  const schemas = makeSchemas(finalIdAttribute, invalidateSchemaCache)

  let contentTypeSchema = schemas[contentTypeOptions.name]

  if (!contentTypeSchema) {
    // Custom content type
    contentTypeSchema = createSchema(
      contentTypeOptions.plural,
      finalIdAttribute
    )
  }

  const schema = Array.isArray(content)
    ? arrayOf(contentTypeSchema)
    : contentTypeSchema

  return normalize(flattened, schema)
}
