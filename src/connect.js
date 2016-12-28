import React, { Component } from 'react'

import { createPostRequest, createQueryRequest, deleteQueries } from './redux/actions'
import { contentTypesManager, invariants } from './util'
import { fetch } from './redux/sagas'
import OperationTypes from './constants/OperationTypes'

// Query UID
let queryId = 0

/** Find an entity in `entities` with the given `identifier`. */
function findEntity (entities, identifier) {
  if (!entities) return {}
  if (typeof identifier === 'number') return entities[String(identifier)] // Entities keyed by ID
  const entity = Object.keys(entities).find((key) => entities[key].slug === identifier) // Entities keyed by slug
  return entity || null
}

/** Filter `entities` to contain only those whose ID is in `identifiers`. */
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

/** Get desired entity identifier. It is either `id` as-is or the result of calling `id` with `props`. */
function identifier (id, props) {
  const realId = typeof id === 'function' ? id(props) : id
  invariants.isIdentifierValue(realId)
  return realId
}

/**
 * Create a connectWp* decorator Higher Order Component.
 * @private
 * @param {String} operation Operation type, Post or Query
 * @param {Object} makePropsData Function to create partial kasia data object for props
 * @param {Object} makePreloader Function to create preloader saga given component props
 * @param {Object} [contentType] Post content type, Post op only
 * @param {Object} [shouldUpdate] Function to determine if query should fire again, Query op only
 * @param {Object} [queryFn] Query function, Query op only
 * @returns {Function} connectWp* decorator
 */
export function _makeConnectWpDecorator (operation, {
  makePropsData,
  makePreloader,
  contentType,
  shouldUpdate,
  queryFn
} = {}) {
  if (!(operation in OperationTypes)) {
    throw new Error(`Unrecognised operation type "${operation}".`)
  }

  return (target) => {
    const displayName = target.displayName || target.name

    invariants.isNotWrapped(target, displayName)

    return class KasiaIntermediateComponent extends Component {
      static __kasia__ = operation
      static makePreloader = makePreloader(displayName)
      static contextTypes = {
        store: React.PropTypes.object.isRequired
      }

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
          const identifier = identifier(props)
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
        const dataKey = OperationTypes.Post === operation ? 'data' : contentType

        if (queryIsOk) {
          const entityData = makePropsData(state, query)
          return Object.assign({}, { query }, { [dataKey]: entityData })
        } else {
          if (query) {
            invariants.queryHasError(query, displayName)
          }

          return Object.assign({}, {
            [dataKey]: null,
            query: { complete: false, OK: null }
          })
        }
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
 * @example Built-in content type, derived slug identifier:
 * ```js
 * const { Page } from 'kasia/types'
 * connectWordPress(Page, (props) => props.params.slug)(Component)
 * ```
 *
 * @example Built-in content type, explicit ID identifier:
 * ```js
 * const { Post } from 'kasia/types'
 * connectWordPress(Post, 16)(Component)
 * ```
 *
 * @example Custom content type, derived identifier:
 * ```js
 * connectWordPress('News', (props) => props.params.slug)(Component)
 * ```
 *
 * @param {String} contentType Content type of the WP entity to fetch
 * @param {Function|String|Number} id Entity's ID/slug/a function that derives either from props
 * @returns {Function} Decorated component
 */
export function connectWpPost (contentType, id) {
  invariants.isString('contentType', contentType)
  invariants.isIdentifierArg(id)

  const config = {
    contentType,
    id,

    /** Produce the component's data object derived from entities in the store. */
    makePropsData: function postMakePropsData (state) {
      const { plural } = contentTypesManager.get(contentType)
      const entityCollection = state.wordpress.entities[plural]
      return findEntity(entityCollection, id)
    },

    /** Determine whether component should make new request for data by inspecting current and next props objects. */
    shouldUpdate: function postShouldUpdate (thisProps, nextProps, buildProps) {
      const typeConfig = contentTypesManager.get(contentType)
      const nextBuiltProps = buildProps(nextProps)

      // Make a call to the query function if..
      return (
        // ..we cannot find the entity in the store using next props
        !nextBuiltProps.kasia[typeConfig.name] &&
        // ..the identifier has changed
        identifier(id, nextProps) !== identifier(id, thisProps)
      )
    },

    /** Create a function that create the component's preloader function given metadata of the component. */
    makePreloader: function postMakePreloader () {
      return (displayName) => (renderProps) => {
        invariants.isValidContentType(contentTypesManager.get(contentType), contentType, displayName)
        return [fetch, createPostRequest({
          contentType,
          identifier: identifier(renderProps)
        })]
      }
    }
  }

  return _makeConnectWpDecorator(OperationTypes.Post, config)
}

/**
 * Connect a component to arbitrary data from WordPress.
 *
 * The component will request new data via the given `queryFn`
 * if `shouldUpdate` returns true.
 *
 * @example Get all posts by an author:
 * ```js
 * connectWpQuery((wpapi) => wpapi.posts().embed().author('David Bowie'), () => true)
 * ```
 *
 * @example Get all pages:
 * ```js
 * connectWpQuery((wpapi) => wpapi.pages().embed(), () => true)
 * ```
 *
 * @example Get custom content type by slug (content type registered at init):
 * ```js
 * connectWpQuery(
 *   (wpapi) => wpapi.news().slug('gullible-removed-from-the-dictionary').embed(),
 *   () => true
 * )
 * ```
 *
 * @example Update only when `props.id` changes:
 * ```js
 * connectWpQuery(
 *   (wpapi, props) => wpapi.page().id(props.identifier()).embed().get(),
 *   (thisProps, nextProps) => thisProps.id !== nextProps.id
 * )
 * ```
 *
 * @param {Function} queryFn Function that returns a wpapi query
 * @param {Function} shouldUpdate Inspect props to determine if new data request is made
 * @returns {Function} Decorated component
 */
export function connectWpQuery (queryFn, shouldUpdate) {
  invariants.isFunction('queryFn', queryFn)
  invariants.isFunction('shouldUpdate', shouldUpdate)

  const config = {
    queryFn,
    shouldUpdate,

    /** Produce the component's data object derived from entities in the store. */
    makePropsData: function queryMakePropsData (state, query) {
      const { entities: stateEntities } = state.wordpress
      return findEntities(stateEntities, query.entities)
    },

    /** Create a function that create the component's preloader function given metadata of the component. */
    makePreloader: function queryMakePreloader () {
      return (displayName) => (renderProps, state) => {
        const realQueryFn = (wpapi) => queryFn(wpapi, renderProps, state)
        return [fetch, createQueryRequest({ queryFn: realQueryFn })]
      }
    }
  }

  return _makeConnectWpDecorator(OperationTypes.Query, config)
}
