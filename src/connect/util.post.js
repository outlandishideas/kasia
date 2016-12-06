import { createPostRequest } from '../redux/actions'
import { fetch } from '../redux/sagas'
import { contentTypesManager, invariants } from '../util'

const util = {}

export default util

/**
 * Find an entity in `entities` with the given `identifier`.
 * @param {Object} entities Entity collection
 * @param {String|Number} identifier Entity ID or slug
 * @returns {Object|null} Entity object if found, null otherwise
 */
function findEntity (entities, identifier) {
  if (!entities) return {}
  // Entities keyed by ID
  if (typeof identifier === 'number') return entities[identifier]
  // Entities keyed by slug
  return Object.keys(entities).find((key) => entities[key].slug === identifier) || null
}

/**
 * Get the desired entity identifier. It is either `id` as-is, or the result of
 * calling `id` with `props` if `id` is a function.
 * @param {Number|String|Function} id Entity identifier or function to derive it from props
 * @param {Object} props Component props object
 * @returns {Number|String} Entity identifier
 */
function identifier (id, props) {
  const realId = typeof id === 'function' ? id(props) : id
  invariants.isIdentifierValue(realId)
  return realId
}

/**
 * Produce an object to be used as the component's Kasia props object when
 * the query for data is incomplete or failed.
 * @param {String} contentType Entity content type
 * @returns {Object} Kasia props object
 */
util.makeEmptyQueryObject = function postMakeEmptyQueryObject (contentType) {
  return {
    query: { complete: false },
    [contentType]: null
  }
}

/**
 * Produce the component's data object derived from entities in the store.
 * @param {Object} state Current store state
 * @param {String} contentType Entity content type
 * @param {Number|String} id Entity identifier
 * @returns {Object} Data to be merged into component's Kasia props object
 */
util.makePropsData = function postMakePropsData (state, { contentType, id }) {
  const { plural, name } = contentTypesManager.get(contentType)
  const entityCollection = state.wordpress.entities[plural]
  return { [name]: findEntity(entityCollection, id) }
}

/**
 * Create a function that create the component's preloader function given metadata of the component.
 * @param {String} contentType Entity content type
 * @returns {Function} Function that creates a preloader function
 */
util.makePreloader = function postMakePreloader (contentType) {
  return (displayName) => (renderProps) => {
    invariants.isValidContentType(contentTypesManager.get(contentType), contentType, displayName)
    return [fetch, createPostRequest({
      contentType,
      identifier: identifier(renderProps)
    })]
  }
}

/**
 * Determine whether the component should make a new request for data by inspecting the
 * current and next props objects.
 * @param {Number|String} id Entity identifier
 * @param {String} contentType Entity content type
 * @param {Object} thisProps Current component props object
 * @param {Object} nextProps Next component props object
 * @param {Function} buildProps Function to create component's next Kasia props object
 * @returns {Boolean} True if should make new request for data, false otherwise
 */
util.shouldUpdate = function postShouldUpdate (id, contentType, thisProps, nextProps, buildProps) {
  const typeConfig = contentTypesManager.get(contentType)
  const nextBuiltProps = buildProps(nextProps)

  // Make a call to the query function if..
  return (
    // ..we cannot find the entity in the store using next props
    !nextBuiltProps.kasia[typeConfig.name] &&
    // ..the identifier has changed
    identifier(id, nextProps) !== identifier(id, thisProps)
  )
}
