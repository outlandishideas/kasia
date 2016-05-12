import { normalize, arrayOf } from 'normalizr'
import humps from 'humps'

import makeSchemas from './makeSchemas'
import flatten from './flatten'

export function normalise (contentType, content, idAttribute, invalidateSchemaCache = false) {
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

export function normaliseFailed(contentType, idAttribute, subject, error, invalidateSchemaCache = false) {
  const content = {
    id: subject,
    slug: subject,
    error: error && error.message ? error.message : error
  };
  return normalise(contentType, content, idAttribute, invalidateSchemaCache);
}
