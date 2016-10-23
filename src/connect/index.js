import React, { Component } from 'react'
import merge from 'lodash.merge'

import { createPostRequest, createQueryRequest } from '../redux/actions'
import contentTypes from '../util/contentTypes'
import OperationTypes from '../constants/OperationTypes'
import invariants from '../util/invariants'
import utils from './util'

// Default `props.kasia` obj when a query failed, is incomplete, or does not exist
const EMPTY_QUERY_OBJ = {
  query: { complete: false },
  data: null
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
 * @returns {Function} connectWp* decorator
 */
function connect (operation, config) {
  const util = utils[operation]

  if (!util) {
    throw new Error(`Unrecognised operation type "${operation}".`)
  }

  const {
    makePreloader, shouldUpdate,
    contentType, // connectWpPost* decorator only
    queryFn // connectWpQuery* decorator only
  } = config

  return (target) => {
    const displayName = target.displayName || target.name

    invariants.isNotWrapped(target, displayName)

    return class KasiaIntermediateComponent extends Component {
      static __kasia = operation
      static contextTypes = CONTEXT_TYPES
      static makePreloader = makePreloader(displayName)

      // ---
      // LIFECYCLE
      // ---

      render () {
        const props = merge({}, this.props, this._reconcileWpData())
        return React.createElement(target, props)
      }

      componentWillMount () {
        if (OperationTypes.Post === operation) {
          invariants.isValidContentType(contentTypes.get(contentType), contentType, displayName)
        }

        const state = this._getState().wordpress

        const query = Object.values(state.queries).find((query) => {
          return query.prepared && query.id === queryId && query.type === operation
        })

        if (query) {
          queryId = queryId + 1
          this.queryId = query.id
        } else {
          this._requestWpData(this.props)
        }
      }

      componentWillReceiveProps (nextProps) {
        const shouldUpdate = shouldUpdate(this.props, nextProps, this._reconcileWpData.bind(this))
        if (shouldUpdate) this._requestWpData(nextProps)
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
          const identifier = util.identifier(props)
          action = createPostRequest({ identifier, contentType })
        } else if (OperationTypes.Query === operation) {
          const wrappedQueryFn = (wpapi) => queryFn(wpapi, props, this._getState())
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
          const entityData = util.makePropsData(this._getState(), query, config)
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
 * @returns {Function} Decorated component
 */
export function connectWpPost (
  contentType,
  id
) {
  invariants.isString('contentType', contentType)
  invariants.isIdentifierArg(id)

  return connect(OperationTypes.Post, {
    contentType,
    id,
    shouldUpdate: utils.Post.shouldUpdate.bind(null, id, contentType),
    makePreloader: utils.Post.makePreloader(contentType)
  })
}

/**
 * Connect a component to arbitrary data from a WP-API query. By default
 * the component will request new data via the given `queryFn` if the
 * `shouldUpdate` returns true. The default property comparison
 * is performed only on primitive values on the props objects.
 *
 * Example, get all posts by an author:
 * ```js
 * connectWpQuery((wpapi) => wpapi.posts().embed().author('David Bowie'))
 * ```
 *
 * Example, get all pages:
 * ```js
 * connectWpQuery((wpapi) => wpapi.pages().embed()
 * ```
 *
 * Example, get custom content type by slug (content type registered at init):
 * ```js
 * connectWpQuery((wpapi) => {
 *   return wpapi.news()
 *     .slug('gullible-removed-from-the-dictionary')
 *     .embed()
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
 * @params {Function} shouldUpdate Inspect props to determine if new data request is made
 * @params {Function} [preserveQueryReturn] Whether return value of `queryFn` should be preserved
 * @returns {Function} Decorated component
 */
export function connectWpQuery (
  queryFn,
  shouldUpdate,
  preserveQueryReturn = false
) {
  invariants.isFunction('queryFn', queryFn)
  invariants.isFunction('shouldUpdate', shouldUpdate)
  invariants.isBoolean('preserveQueryReturn', preserveQueryReturn)

  return connect(OperationTypes.Query, {
    queryFn,
    shouldUpdate,
    makePreloader: utils.Query.makePreloader(queryFn)
  })
}
