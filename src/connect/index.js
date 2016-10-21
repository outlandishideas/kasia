import React, { Component } from 'react'
import merge from 'lodash.merge'

import { createPostRequest, createQueryRequest } from '../redux/actions'
import contentTypes from '../util/contentTypes'
import OperationTypes from '../constants/OperationTypes'
import invariants from '../util/invariants'
import UTIL from './util'

// Default connectWp* user options
const DEFAULT_OPTIONS = {
  displayName: ''
}

// Default `props.kasia` obj when a query failed, is incomplete, or does not exist
const EMPTY_QUERY_OBJ = {
  query: { complete: false },
  entities: {}
}

// Intermediate component context types
const CONTEXT_TYPES = {
  store: React.PropTypes.object.isRequired
}

// Query UID
let queryId = 0

/**
 * Build a connectWp* decorator.
 * @param {String} operation
 * @param {Object} config Internal configuration
 * @param {Object} options User options
 * @returns {Function} connectWp* decorator
 */
function connect (operation, config, options) {
  const util = UTIL[operation]

  if (!util) {
    throw new Error(`Unrecognised operation type "${operation}".`)
  }

  return (target) => {
    const displayName = options.displayName || target.displayName || target.name

    invariants.isNotWrapped(target, displayName)

    return class KasiaIntermediateComponent extends Component {
      static __kasia = true
      static contextTypes = CONTEXT_TYPES
      static makePreloader = config.makePreloader(displayName)

      // ---
      // LIFECYCLE
      // ---

      render () {
        const props = merge({}, this.props, this._reconcileWpData())
        return React.createElement(target, props)
      }

      componentWillMount () {
        if (OperationTypes.Post === operation) {
          const contentType = config.contentType
          invariants.isValidContentType(contentTypes.get(contentType), contentType, displayName)
        }

        const state = this._getState().wordpress

        const query = Object.values(state.queries).find((query) => {
          return query.prepared &&
            query.id === queryId++ &&
            query.type === operation &&
            query.target === displayName
        })

        if (query) {
          this.queryId = query.id
        } else {
          this._requestWpData(this.props)
        }
      }

      componentWillReceiveProps (nextProps) {
        let shouldDispatch = false

        if (OperationTypes.Post === operation) {
          const { id, contentType } = config
          const typeConfig = contentTypes.get(contentType)
          const nextBuiltProps = this._reconcileWpData(nextProps)

          shouldDispatch = (
            // changed identifier
            !nextBuiltProps.kasia[typeConfig.name] &&
            // cannot derive entity from existing props
            util.getIdentifier(id, nextProps) !== util.getIdentifier(id, this.props)
          )
        } else if (OperationTypes.Query === operation) {
          shouldDispatch = config.shouldUpdate(this.props, nextProps)
        }

        if (shouldDispatch) {
          this._requestWpData(nextProps)
        }
      }

      // ---
      // UTILITY
      // ---

      _getState () {
        return this.context.store._getState()
      }

      _requestWpData (props) {
        let action = null

        if (OperationTypes.Post === operation) {
          const identifier = this.getIdentifier(props)
          action = createPostRequest({ identifier, contentType: config.contentType })
        } else if (OperationTypes.Query === operation) {
          const wrappedQueryFn = (wpapi) => config.queryFn(wpapi, props, this._getState())
          action = createQueryRequest({ queryFn: wrappedQueryFn })
        }

        if (action) {
          this.queryId = queryId++
          this.context.store.dispatch(action)
        }
      }

      _reconcileWpData () {
        const query = this._getState().wordpress.queries[this.queryId]
        const queryIsOk = query && !query.error

        if (queryIsOk) {
          const state = this._getState()
          const entityData = util.makePropsData(state, query, config)

          return { query, ...entityData }
        }

        if (query) {
          invariants.queryHasError(query, displayName)
        }

        return EMPTY_QUERY_OBJ
      }
    }
  }
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
export function connectWpPost (
  contentType,
  id,
  options = DEFAULT_OPTIONS
) {
  invariants.isString('contentType', contentType)
  invariants.isIdentifierArg(id)
  invariants.isObject('options', options)
  invariants.isString('options.displayName', options.displayName)

  const config = {
    contentType,
    id,
    makePreloader: UTIL.Post.makePreloader(contentType)
  }

  return connect(OperationTypes.Post, config, options)
}

/**
 * Connect a component to arbitrary data from a WP-API query. By default
 * the component will request new data via the given `queryFn` if the
 * `shouldUpdate` returns true. The default property comparison
 * is performed only on primitive values on the props objects.
 *
 * Example, get all posts by an author:
 * ```js
 * connectWpQuery((wpapi) => wpapi.posts().embed().author('David Bowie').get())
 * ```
 *
 * Example, get all pages:
 * ```js
 * connectWpQuery((wpapi) => wpapi.pages().embed().get())
 * ```
 *
 * Example, get custom content type by slug (content type registered at init):
 * ```js
 * connectWpQuery((wpapi) => {
 *   return wpapi.news()
 *     .slug('gullible-removed-from-the-dictionary')
 *     .embed()
 *     .get()
 * })
 * ```
 *
 * Example, with custom props comparator:
 * ```js
 * connectWpQuery(
 *   (wpapi, props) => wpapi.page().id(props.identifier()).embed().get(),
 *   (thisProps, nextProps) => thisProps.identifier() !== nextProps.identifier()
 * )
 * ```
 *
 * @params {Function} queryFn Function that returns a wpapi query
 * @params {Function} shouldUpdate Function that determines if new data should be requested by inspecting props
 * @params {String} [options.displayName] Display name of the component, useful if component is wrapped by other
 *                                        decorators which will disguise the actual `displayName`. Important if
 *                                        the component is used with prepared queries (server-side rendering).
 * @returns {Function} Decorated component
 */
export function connectWpQuery (
  queryFn,
  shouldUpdate = UTIL.Query.defaultShouldUpdate,
  options = DEFAULT_OPTIONS
) {
  invariants.isFunction('queryFn', queryFn)
  invariants.isFunction('shouldUpdate', shouldUpdate)
  invariants.isObject('options', options)
  invariants.isString('options.displayName', options.displayName)

  const config = {
    queryFn,
    shouldUpdate,
    makePreloader: UTIL.Query.makePreloader(queryFn)
  }

  return connect(OperationTypes.Query, config, options)
}
