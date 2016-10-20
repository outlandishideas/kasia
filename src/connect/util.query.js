import isEqualWith from 'lodash.isequalwith'

import { createQueryRequest } from '../redux/actions'
import { fetch } from '../redux/sagas'

/**
 * Filter `entities` to contain only those whose ID is in `identifiers`.
 * @param {Object} entities Entities by type, e.g. { posts: {}, ... }
 * @param {Array} identifiers IDs of the entities to pick
 * @returns {Object}
 */
export function findEntities (entities, identifiers) {
  identifiers = identifiers.map(String)

  return Object.keys(entities).reduce((reduced, entityTypeName) => {
    Object.keys(entities[entityTypeName]).forEach((entityId) => {
      const obj = entities[entityTypeName][entityId]

      if (identifiers.indexOf(entityId) !== -1) {
        reduced[entityTypeName] = reduced[entityTypeName] || {}
        reduced[entityTypeName][entityId] = obj
      }
    })

    return reduced
  }, {})
}

/**
 * Determine if a value is a primitive. (http://bit.ly/2bf3FYJ)
 * @param {*} value Value to inspect
 * @returns {Boolean} Whether value is primitive
 */
function isPrimitive (value) {
  const type = typeof value
  return value == null || (type !== 'object' && type !== 'function')
}

/**
 * Determines if new request for data should be made when props are received. Only
 * inspect primitives by default. Returning `undefined` makes isEqualWith fallback
 * to built-in comparator.
 * @param {Object} thisProps Current props object
 * @param {Object} nextProps Next props object
 * @returns {Boolean}
 */
export function shouldUpdate (thisProps, nextProps) {
  return !isEqualWith(thisProps, nextProps, (value) => {
    return isPrimitive(value) ? undefined : true
  })
}

export function makePreloader (queryFn) {
  return (displayName) => (renderProps, state) =>  {
    return [fetch, createQueryRequest({
      queryFn: (wpapi) => queryFn(wpapi, renderProps, state),
      target: displayName
    })]
  }
}

export function makePropsData (state, query) {
  const { entities: stateEntities } = state.wordpress
  const entities = findEntities(stateEntities, query.entities)

  return { entities }
}
