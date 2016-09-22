import React, { Component } from 'react'
import merge from 'lodash.merge'

import { fetch } from '../sagas'
import { getContentType } from '../contentTypes'
import { createPostRequest, subtractPreparedQueries } from '../actions'
import invariants from '../invariants'
import isNode from '../isNode'

const __IS_NODE__ = isNode()

/**
 * Find an entity in `entities` with the given `identifier`.
 * @param {Object} entities Entity collection
 * @param {String|Number} identifier Entity ID or slug
 * @returns {Object}
 */
function findEntity (entities, identifier) {
  if (typeof identifier === 'number') {
    return entities[identifier]
  }

  const id = Object.keys(entities).find((key) => {
    return entities[key].slug === identifier
  })

  return id ? entities[id] : null
}

/**
 * Connect a component to a single entity from the WP-API.
 *
 * Built-in content type, derived slug identifier:
 * ```js
 * const { Page } from 'kasia/types'
 * connectWordPress(Page, (props) => props.params.slug)(Component)
 * ```
 *
 * Built-in content type, explicit ID identifier:
 * ```js
 * const { Post } from 'kasia/types'
 * connectWordPress(Post, 16)(Component)
 * ```
 *
 * Custom content type, derived identifier:
 * ```js
 * connectWordPress('News', (props) => props.params.slug)(Component)
 * ```
 *
 * @params {String} contentType Content type of the WP entity to fetch
 * @params {Function|String|Number} id Entity's ID/slug/a function that derives either from props
 * @params {String} [options.displayName] Display name of the component, useful if component is wrapped by other
 *                                        decorators which will disguise the actual `displayName`. Important if
 *                                        the component is used with prepared queries (server-side rendering).
 * @returns {Function} Decorated component
 */
export default function connectWpPost (
  contentType,
  id,
  options = {
    displayName: ''
  }
) {
  invariants.isString('contentType', contentType)
  invariants.isIdentifierArg(id)
  invariants.isObject('options', options)
  invariants.isString('options.displayName', options.displayName)

  return (target) => {
    const targetName = options.displayName ||
      target.displayName ||
      target.name

    const getIdentifier = (props) => {
      const realId = typeof id === 'function' ? id(props) : id
      invariants.isIdentifierValue(realId)
      return realId
    }

    invariants.isNotWrapped(target, targetName)

    return class KasiaIntermediateComponent extends Component {
      static __kasia = true

      static contextTypes = {
        store: React.PropTypes.object.isRequired
      }

      static makePreloader = (renderProps) => {
        invariants.isValidContentType(getContentType(contentType), contentType, targetName)

        const identifier = getIdentifier(renderProps)

        const action = createPostRequest({
          contentType,
          identifier,
          target: targetName
        })

        return [fetch, action]
      }

      render () {
        const props = merge({}, this.props, this.reconcileWpData(this.props))
        return React.createElement(target, props)
      }

      componentWillMount () {
        invariants.isValidContentType(getContentType(contentType), contentType, targetName)

        const state = this.context.store.getState().wordpress

        const isNode = typeof this.props.__IS_NODE__ !== 'undefined'
          ? this.props.__IS_NODE__
          : __IS_NODE__

        if (state.__kasia__.numPreparedQueries) {
          const query = Object
            .values(state.queries)
            .find((query) => query.target === targetName)

          if (query) {
            this.queryId = typeof this.props.__QUERY_ID__ !== 'undefined'
              ? this.props.__QUERY_ID__
              : query.id

            if (!isNode) {
              this.context.store.dispatch(subtractPreparedQueries())
            }
          }
        } else {
          this.dispatchRequestAction(this.props)
        }
      }

      componentWillReceiveProps (nextProps) {
        const { name } = getContentType(contentType)
        const nextBuiltProps = this.reconcileWpData(nextProps)
        const changedIdentifier = getIdentifier(nextProps) !== getIdentifier(this.props)
        const cannotDeriveEntityFromNextProps = !nextBuiltProps.kasia[name]

        if (changedIdentifier && cannotDeriveEntityFromNextProps) {
          this.dispatchRequestAction(nextProps)
        }
      }

      dispatchRequestAction (props) {
        const identifier = getIdentifier(props)
        const action = createPostRequest({ contentType, identifier })
        const state = this.context.store.getState()

        this.queryId = state.wordpress.__kasia__.nextQueryId
        this.context.store.dispatch(action)
      }

      reconcileWpData (props) {
        const { plural, name } = getContentType(contentType)
        const state = this.context.store.getState()
        const query = state.wordpress.queries[this.queryId]

        if (!query || query.error) {
          query && invariants.queryErrorFree(query, targetName)

          return {
            kasia: {
              query: { complete: false },
              [name]: null
            }
          }
        }

        const entityCollection = state.wordpress.entities[plural] || {}
        const entityId = getIdentifier(props)

        return {
          kasia: {
            query,
            [name]: findEntity(entityCollection, entityId)
          }
        }
      }
    }
  }
}
