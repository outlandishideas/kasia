import { createQueryRequest } from '../redux/actions'
import { fetch } from '../redux/sagas'

const util = {}

export default util

/**
 * Filter `entities` to contain only those whose ID is in `identifiers`.
 * @param {Object} entities Entities by type, e.g. { posts: {}, ... }
 * @param {Array} identifiers IDs of the entities to pick
 * @returns {Object}
 */
function findEntities (entities, identifiers) {
  identifiers = identifiers.map(String)

  return Object.keys(entities).reduce((reduced, entityTypeName) => {
    return Object.keys(entities[entityTypeName]).reduce((reduced, entityId) => {
      const obj = entities[entityTypeName][entityId]

      if (identifiers.indexOf(entityId) !== -1) {
        reduced[entityTypeName] = reduced[entityTypeName] || {}
        reduced[entityTypeName][entityId] = obj
      }

      return reduced
    }, reduced)
  }, {})
}

/**
 * Produce an object to be used as the component's Kasia props object when
 * the query for data is incomplete or failed.
 * @returns {Object} Kasia props object
 */
util.makeEmptyQueryObject = function queryMakeEmptyQueryObject () {
  return {
    query: { complete: false },
    data: null
  }
}

/**
 * Produce the component's data object derived from entities in the store.
 * @param {Object} state Current store state
 * @param {Object} query Component's query object
 * @returns {Object} Data to be merged into component's Kasia props object
 */
util.makePropsData = function queryMakePropsData (state, query) {
  const { entities: stateEntities } = state.wordpress
  const data = findEntities(stateEntities, query.entities)
  return { data }
}

/**
 * Create a function that create the component's preloader function given metadata of the component.
 * @param {Function} queryFn WP API query function
 * @returns {Function} Function that creates a preloader function
 */
util.makePreloader = function queryMakePreloader (queryFn) {
  return (displayName) => (renderProps, state) => {
    const realQueryFn = (wpapi) => queryFn(wpapi, renderProps, state)
    return [fetch, createQueryRequest({ queryFn: realQueryFn })]
  }
}
