import pickToArray from 'pick-to-array'

import contentTypesManager from './contentTypesManager'
import { ContentTypesWithoutId } from '../constants'

/**
 * Pick all entity identifiers from a WP-API response.
 * @param {Object} data Raw WP-API JSON
 * @returns {Array} Entity identifiers
 */
export default function pickEntityIds (data) {
  const entityIdentifiers = pickToArray(data, 'id')

  // Accommodate content types that do not have an `id` property
  ;[].concat(data).forEach((entity) => {
    const type = contentTypesManager.derive(entity)
    if (ContentTypesWithoutId.includes(type)) {
      entityIdentifiers.push(...pickToArray(entity, 'slug'))
    }
  })

  return entityIdentifiers
}
