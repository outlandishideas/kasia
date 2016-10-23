import pickToArray from 'pick-to-array'

import { ContentTypesWithoutId } from '../constants/ContentTypes'
import contentTypesManager from './contentTypesManager'

/**
 * Pick all entity identifiers from a raw WP-API response.
 * @param {Object} data Raw WP-API JSON
 * @returns {Array} Entity identifiers
 */
export default function pickEntityIds (data) {
  let entityIdentifiers = pickToArray(data, 'id')

  // Accommodate content types that do not have an `id` property
  data.forEach((entity) => {
    const type = contentTypesManager.derive(entity)
    if (ContentTypesWithoutId[type]) {
      entityIdentifiers = entityIdentifiers.concat(pickToArray(entity, 'slug'))
    }
  })

  return entityIdentifiers
}
