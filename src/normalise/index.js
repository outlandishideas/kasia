import { normalize, arrayOf } from 'normalizr';
import humps from 'humps';

import makeSchemas from './makeSchemas';
import flatten from './flatten';

export default function normalise (contentType, content, idAttribute, invalidateSchemaCache = false) {
  const schemas = makeSchemas(idAttribute, invalidateSchemaCache);
  const contentTypeSchema = schemas[contentType];
  const schema = Array.isArray(content) ? arrayOf(contentTypeSchema) : contentTypeSchema;
  return normalize(flatten(humps.camelizeKeys(content)), schema);
}
