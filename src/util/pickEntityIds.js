import pickToArray from 'pick-to-array'

import { ContentTypesWithoutId } from '../constants/ContentTypes'
import contentTypes from '../util/contentTypes'

/**
 * Pick all entity identifiers from a raw WP-API response.
 * @param {Object} data Raw WP-API JSON
 * @returns {Array} Entity identifiers
 */
export default function pickEntityIds (data) {
  return data.reduce((entityIdentifiers, entity) => {
    const type = contentTypes.derive(entity)

    if (ContentTypesWithoutId[type]) {
      // Pick `slug` for types that do not have an `id`
      const ids = pickToArray(entity, 'slug')
      entityIdentifiers.push(...ids)
    }

    return entityIdentifiers
  }, pickToArray(data, 'id'))
}
