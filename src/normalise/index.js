import { normalize, arrayOf } from 'normalizr'
import humps from 'humps'

import makeSchemas from './makeSchemas'
import flatten from './flatten'

export default function normalise (contentType, content, idAttribute, invalidateSchemaCache = false) {
  const flattened = flatten(humps.camelizeKeys(content))

  const finalIdAttribute = typeof idAttribute === 'function'
    ? idAttribute(flattened)
    : idAttribute

  const schemas = makeSchemas(finalIdAttribute, invalidateSchemaCache)
  const contentTypeSchema = schemas[contentType]

  const schema = Array.isArray(content)
    ? arrayOf(contentTypeSchema)
    : contentTypeSchema

  return normalize(flattened, schema)
}
