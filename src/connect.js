import React from 'react'

import debug from './util/debug'
import contentTypesManager from './util/contentTypesManager'
import invariants from './invariants'
import queryCounter from './util/queryCounter'
import findEntities from './util/findEntities'
import { createPostRequest, createQueryRequest } from './redux/actions'
import { fetch } from './redux/sagas'

const WARN_NO_ENTITIES_PROP = 0
const WARN_NO_REWIND = 1

// Is a component the first Kasia component to mount?
let firstMount = true

// What have we warned the consumer of?
let haveWarned = []

/** Reset first mount flag, should be called before SSR of each request. */
export function rewind () {
  firstMount = true
}

/** Get entity identifier: either `id` as-is or the result of calling `id(props)`. */
export function identifier (displayName, id, props) {
  const realId = typeof id === 'function' ? id(props) : id
  invariants.isIdentifierValue(realId, displayName)
  return realId
}

/** Wrap `queryFn` in a function that takes the node-wpapi instance. */
export function wrapQueryFn (queryFn, props, state) {
  return (wpapi) => queryFn(wpapi, props, state)
}

const base = (target) => {
  const displayName = target.displayName || target.name

  return class extends React.Component {
    static __kasia__ = true

    static WrappedComponent = target

    static contextTypes = {
      store: React.PropTypes.object.isRequired
    }

    _getState () {
      const state = this.context.store.getState()
      invariants.hasWordpressObject(state.wordpress)
      return state
    }

    /** Make request for new data from WP-API. Allow re-use of `queryId` in case of no query on mount. */
    _requestWpData (props, queryId) {
      const action = this._getRequestWpDataAction(props)
      action.id = queryId
      this.queryId = queryId
      this.context.store.dispatch(action)
    }

    /** Find the query for this component and its corresponding data and return props object containing them. */
    _reconcileWpData (props) {
      const query = this._getState().wordpress.queries[this.queryId]
      const data = this._makePropsData(query, props)
      const fallbackQuery = { complete: false, OK: null }

      if (query) {
        invariants.queryHasError(query, displayName)
      }

      const result = {
        kasia: {
          query: query || fallbackQuery,
          [this.dataKey]: data
        }
      }

      debug(`content for ${displayName} on \`props.kasia.${this.dataKey}\``)

      return Object.defineProperty(result, 'entities', {
        get: () => {
          if (!haveWarned[WARN_NO_ENTITIES_PROP]) {
            console.log('[kasia] `props.kasia.entities` is replaced by `props.kasia.data` in v4.')
            haveWarned[WARN_NO_ENTITIES_PROP] = true
          }
        }
      })
    }

    componentWillMount () {
      const state = this._getState().wordpress
      const numQueries = Object.keys(state.queries).length - 1
      const nextCounterIndex = queryCounter.current() + 1

      if (numQueries > nextCounterIndex && !haveWarned[WARN_NO_REWIND]) {
        console.log(
          '[kasia] the query counter and queries in the store are not in sync. ' +
          'This may be because you are not calling `kasia.rewind()` before running preloaders.'
        )
        haveWarned[WARN_NO_REWIND] = true
      }

      // When doing SSR we need to reset the counter so that components start
      // at queryId=0, aligned with the preloaders that have been run for them.
      if (firstMount) {
        queryCounter.reset()
        firstMount = false
      }

      const queryId = this.queryId = queryCounter.next()
      const query = state.queries[queryId]

      if (query && query.prepared) {
        // We found a prepared query matching `queryId` - use it.
        debug(`found prepared data for ${displayName} at queryId=${queryId}`)
      } if (!query) {
        // Request new data and reuse the queryId
        this._requestWpData(this.props, queryId)
      } else if (!query.prepared) {
        // Request new data with new queryId
        this._requestWpData(this.props, queryCounter.next())
      }
    }

    componentWillReceiveProps (nextProps) {
      const willUpdate = this._shouldUpdate(this.props, nextProps)
      if (willUpdate) this._requestWpData(nextProps, queryCounter.next())
    }

    render () {
      const props = Object.assign({}, this.props, this._reconcileWpData(this.props))
      return React.createElement(target, props)
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

  const typeConfig = contentTypesManager.get(contentType)

  return (target) => {
    const displayName = target.displayName || target.name

    invariants.isNotWrapped(target, displayName)

    return class connectWpPostComponent extends base(target) {
      constructor (props, context) {
        super(props, context)
        this.dataKey = contentType
      }

      static preload (props) {
        debug(displayName, 'connectWpPost preload with props:', props)
        invariants.isValidContentType(typeConfig, contentType, `${displayName} component`)
        const action = createPostRequest(contentType, identifier(displayName, id, props))
        action.id = queryCounter.next()
        return [fetch, action]
      }

      _getRequestWpDataAction (props) {
        debug(displayName, 'connectWpPost request with props:', props)
        const realId = identifier(displayName, id, props)
        return createPostRequest(contentType, realId)
      }

      _makePropsData (query, props) {
        if (!query || !query.complete || query.error) return null
        const realId = identifier(displayName, id, props)
        const entities = this._getState().wordpress.entities[typeConfig.plural]
        return entities[realId] || null
      }

      _shouldUpdate (thisProps, nextProps) {
        const state = this._getState().wordpress
        const query = state.queries[this.queryId]
        const entity = this._makePropsData(query, nextProps)

        // Make a request for new data if..
        return (
          // ..we can't find the entity in store using next props
          !entity &&
          // ..the identifier has changed
          identifier(displayName, id, nextProps) !== identifier(displayName, id, thisProps)
        )
      }

      componentWillMount () {
        invariants.isValidContentType(typeConfig, contentType, `${displayName} component`)
        super.componentWillMount()
      }
    }
  }
}

/**
 * Connect a component to arbitrary data from WordPress.
 *
 * The component will request new data via the given `queryFn` if `shouldUpdate` returns true.
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

  return (target) => {
    const displayName = target.displayName || target.name

    invariants.isNotWrapped(target, displayName)

    return class connectWpQueryComponent extends base(target) {
      constructor (props, context) {
        super(props, context)
        this.dataKey = 'data'
        this._shouldUpdate = shouldUpdate
      }

      static preload (props, state) {
        debug(displayName, 'connectWpQuery preload with props:', props, 'state:', state)
        const wrappedQueryFn = wrapQueryFn(queryFn, props, state)
        const action = createQueryRequest(wrappedQueryFn)
        action.id = queryCounter.next()
        return [fetch, action]
      }

      _getRequestWpDataAction (props) {
        debug(displayName, 'connectWpQuery request with props:', props)
        const wrappedQueryFn = wrapQueryFn(queryFn, props, this._getState())
        return createQueryRequest(wrappedQueryFn)
      }

      _makePropsData (query) {
        if (!query || !query.complete || query.error) return {}
        const state = this._getState().wordpress
        return findEntities(state.entities, state.keyEntitiesBy, query.entities)
      }
    }
  }
}
