import { createQueryRequest } from '../redux/actions'
import { fetch } from '../redux/sagas'

export function makePropsData (state, query) {
  const { entities: stateEntities } = state.wordpress
  const data = findEntities(stateEntities, query.entities)
  return { data }
}

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

export function makePreloader (queryFn) {
  return (displayName) => (renderProps, state) =>  {
    const realQueryFn = (wpapi) => queryFn(wpapi, renderProps, state)
    return [fetch, createQueryRequest({ queryFn: realQueryFn })]
  }
}
