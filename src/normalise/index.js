import { normalize, Schema, arrayOf } from 'normalizr'
import humps from 'humps'

import Plurality from '../constants/Plurality'
import makeSchemas, { addSchema } from './makeSchemas'
import flatten from './flatten'

export function normalise (contentTypeOptions, content, idAttribute, invalidateSchemaCache = false) {
  const flattened = flatten(humps.camelizeKeys(content))

  const finalIdAttribute = typeof idAttribute === 'function'
    ? idAttribute(flattened)
    : idAttribute

  const schemas = makeSchemas(finalIdAttribute, invalidateSchemaCache)

  let contentTypeSchema = schemas[contentTypeOptions.name.canonical]

  if (!contentTypeSchema) {
    const name = contentTypeOptions.name[Plurality.SINGULAR].toLowerCase()
    contentTypeSchema = addSchema(name, finalIdAttribute)
  }

  const schema = Array.isArray(content)
    ? arrayOf(contentTypeSchema)
    : contentTypeSchema

  return normalize(flattened, schema)
}

export function normaliseFailed(contentTypeOptions, idAttribute, subject, error, invalidateSchemaCache = false) {
  const content = {
    id: subject,
    slug: subject,
    error: error && error.message ? error.message : error
  };
  return normalise(contentTypeOptions.name.canonical, content, idAttribute, invalidateSchemaCache);
}
