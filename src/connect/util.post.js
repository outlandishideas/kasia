import { createPostRequest } from '../redux/actions'
import { fetch } from '../redux/sagas'
import contentTypes from '../util/contentTypes'
import invariants from '../util/invariants'

export function makePropsData (state, { contentType, id }) {
  const { plural, name } = contentTypes.get(contentType)
  const entityCollection = state.wordpress.entities[plural]
  return { [name]: findEntity(entityCollection, id) }
}

/**
 * Find an entity in `entities` with the given `identifier`.
 * @param {Object} entities Entity collection
 * @param {String|Number} identifier Entity ID or slug
 * @returns {Object}
 */
export function findEntity (entities, identifier) {
  if (!entities) {
    return {}
  }

  if (typeof identifier === 'number') {
    return entities[identifier]
  }

  return Object.keys(entities).find((key) => {
    return entities[key].slug === identifier
  }) || null
}

export function makePreloader (contentType) {
  return (displayName) => (renderProps) => {
    invariants.isValidContentType(contentTypes.get(contentType), contentType, displayName)

    const action = createPostRequest({
      contentType,
      identifier: identifier(renderProps),
    })

    return [fetch, action]
  }
}

export function identifier (id, props) {
  const realId = typeof id === 'function' ? id(props) : id
  invariants.isIdentifierValue(realId)
  return realId
}

export function shouldUpdate (id, contentType, thisProps, nextProps, buildProps) {
  const typeConfig = contentTypes.get(contentType)
  const nextBuiltProps = buildProps(nextProps)

  return (
    // changed identifier
    !nextBuiltProps.kasia[typeConfig.name] &&
    // cannot derive entity from existing props
    identifier(id, nextProps) !== identifier(id, thisProps)
  )
}
