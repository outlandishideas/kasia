import React, { Component } from 'react'

import { createPostRequest, createQueryRequest, deleteQueries } from '../redux/actions'
import { contentTypesManager, invariants } from '../util'
import OperationTypes from '../constants/OperationTypes'
import postUtils from './util.post'
import queryUtils from './util.query'

// Intermediate component context types
const CONTEXT_TYPES = {
  store: React.PropTypes.object.isRequired
}

// Query UID
let queryId = 0

/**
 * Create a connectWp* decorator Higher Order Component.
 * @param {String} operation Operation type, Post or Query
 * @param {Object} config Decorator configuration object
 * @param {Object} config.emptyQueryObject An object that represents an incomplete or erroneous query
 * @param {Object} config.makePreloader Function to create preloader saga given component props
 * @param {Object} [config.contentType] Post content type, Post op only
 * @param {Object} [config.shouldUpdate] Function to determine if query should fire again, Query op only
 * @param {Object} [config.queryFn] Query function, Query op only
 * @returns {Function} connectWp* decorator
 */
export function makeConnectWpDecorator (operation, config) {
  const {
    emptyQueryObject,
    makePreloader,
    contentType,
    shouldUpdate,
    queryFn
  } = config

  const util = {
    [OperationTypes.Post]: postUtils,
    [OperationTypes.Query]: queryUtils
  }[operation]

  if (!util) {
    throw new Error(`Unrecognised operation type "${operation}".`)
  }

  return (target) => {
    const displayName = target.displayName || target.name

    invariants.isNotWrapped(target, displayName)

    return class KasiaIntermediateComponent extends Component {
      static __kasia__ = operation
      static contextTypes = CONTEXT_TYPES
      static makePreloader = makePreloader(displayName)

      constructor (props, context) {
        super(props, context)
        this.queryIds = []
      }

      // ---
      // UTILITY
      // ---

      _getState () {
        return this.context.store._getState()
      }

      _requestWpData (props) {
        let action

        if (OperationTypes.Post === operation) {
          const identifier = util.identifier(props)
          action = createPostRequest({ identifier, contentType })
        } else if (OperationTypes.Query === operation) {
          const wrappedQueryFn = (wpapi) => queryFn(wpapi, props, this._getState())
          action = createQueryRequest({ queryFn: wrappedQueryFn })
        }

        this.queryId = queryId++
        this.queryIds.push(queryId)
        this.context.store.dispatch(action)
      }

      _reconcileWpData () {
        const state = this._getState()
        const query = state.wordpress.queries[this.queryId]
        const queryIsOk = query && !query.error

        if (queryIsOk) {
          const entityData = util.makePropsData(state, query, config)
          return Object.assign({}, query, entityData)
        } else if (query) {
          invariants.queryHasError(query, displayName)
        }

        return Object.assign({}, emptyQueryObject)
      }

      // ---
      // LIFECYCLE
      // ---

      componentWillUnmount () {
        this.context.store.dispatch(deleteQueries(this.queryIds))
      }

      componentWillMount () {
        const state = this._getState().wordpress

        invariants.hasWordpressObject(state)

        if (OperationTypes.Post === operation) {
          invariants.isValidContentType(contentTypesManager.get(contentType), contentType, displayName)
        }

        const query = Object.values(state.queries).find((query) => {
          return query.prepared && query.id === queryId && query.type === operation
        })

        if (query) {
          queryId = queryId + 1
          this.queryId = query.id
          this.queryIds.push(queryId)
        } else {
          this._requestWpData(this.props)
        }
      }

      componentWillReceiveProps (nextProps) {
        const willUpdate = shouldUpdate(this.props, nextProps, this._reconcileWpData.bind(this))
        if (willUpdate) this._requestWpData(nextProps)
      }

      render () {
        const props = Object.assign({}, this.props, this._reconcileWpData())
        return React.createElement(target, props)
      }
    }
  }
}

/**
 * Connect a component to a single entity from WordPress.
 *
 * @example
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

  return makeConnectWpDecorator(OperationTypes.Post, {
    contentType,
    id,
    shouldUpdate: postUtils.shouldUpdate.bind(null, id, contentType),
    makePreloader: postUtils.makePreloader(contentType),
    emptyQueryObject: postUtils.makeEmptyQueryObject(contentType)
  })
}

/**
 * Connect a component to arbitrary data from WordPress.
 *
 * The component will request new data via the given `queryFn`
 * if `shouldUpdate` returns true.
 *
 * @example
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
  shouldUpdate
) {
  invariants.isFunction('queryFn', queryFn)
  invariants.isFunction('shouldUpdate', shouldUpdate)

  return makeConnectWpDecorator(OperationTypes.Query, {
    queryFn,
    shouldUpdate,
    makePreloader: queryUtils.makePreloader(queryFn),
    emptyQueryObject: queryUtils.makeEmptyQueryObject()
  })
}
