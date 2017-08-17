import React from 'react'
import { get } from 'lodash.get'
import { connect as reduxConnect } from 'react-redux'

import debug from './util/debug'
import contentTypesManager from './util/content-types-manager'
import invariants from './invariants'
import queryCounter from './util/query-counter'
import findEntities from './util/find-entities'
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

/** Wrap component in react-redux connect. */
function connect (cls) {
  return reduxConnect(({ wordpress }) => {
    invariants.hasWordpressObject(wordpress)
    return { wordpress }
  })(cls)
}

const base = (target) => {
  const displayName = target.displayName || target.name

  return class KasiaConnectedComponent extends React.Component {
    static __kasia__ = true

    static WrappedComponent = target

    static contextTypes = {
      store: React.PropTypes.object.isRequired
    }

    /** Make request for new data from WP-API. */
    _requestWpData (props, queryId) {
      const action = this._getRequestWpDataAction(props)
      action.id = queryId
      this.queryId = queryId
      this.props.dispatch(action)
    }

    /** Find the query for this component and its corresponding data and return props object containing them. */
    _reconcileWpData (props) {
      const query = this._query()
      const data = this._makePropsData(props)
      const fallbackQuery = { complete: false, OK: null }

      if (query && query.error) {
        console.log(`[kasia] error in query for ${displayName}:`)
        console.log(query.error)
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

    _query () {
      return this.props.wordpress.queries[this.queryId]
    }

    componentWillMount () {
      const state = this.props.wordpress
      const numQueries = Object.keys(state.queries).length
      const nextCounterIndex = queryCounter.observeNext()

      if (numQueries !== nextCounterIndex && !haveWarned[WARN_NO_REWIND]) {
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

      // We found a prepared query matching `queryId` - use it.
      if (query && query.prepared) debug(`found prepared data for ${displayName} at queryId=${queryId}`)
      // Did not find prepared query so request new data and reuse the queryId
      else if (!query) this._requestWpData(this.props, queryId)
      // Request new data with new queryId
      else if (!query.prepared) this._requestWpData(this.props, queryCounter.next())
    }

    componentWillReceiveProps (nextProps) {
      const willUpdate = this._shouldUpdate(this.props, nextProps, this.context.store.getState())
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

    class KasiaConnectWpPostComponent extends base(target) {
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

      _makePropsData (props) {
        const query = this._query()

        if (!query || !query.complete || query.error) return null

        const entities = this.props.wordpress.entities[typeConfig.plural]

        if (entities) {
          const keys = Object.keys(entities)
          const realId = identifier(displayName, id, props)

          for (let i = 0, len = keys.length; i < len; i++) {
            const entity = entities[keys[i]]
            if (entity.id === realId || entity.slug === realId) return entity
          }
        }

        return null
      }

      _shouldUpdate (thisProps, nextProps) {
        // Make a request for new data if entity not in store or the identifier has changed
        const entity = this._makePropsData(nextProps)
        return !entity && identifier(displayName, id, nextProps) !== identifier(displayName, id, thisProps)
      }

      componentWillMount () {
        invariants.isValidContentType(typeConfig, contentType, `${displayName} component`)
        super.componentWillMount()
      }
    }

    return connect(KasiaConnectWpPostComponent)
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
 * connectWpQuery((wpapi, props) => {
 *   return wpapi.page().id(props.identifier()).embed().get()
 * }, 'id')
 * ```
 *
 * @param {Function} queryFn Function that returns a wpapi query
 * @param {Function|String} [shouldUpdate] Inspect props to determine if new data request is made
 * @returns {Function} Decorated component
 */
export function connectWpQuery (queryFn, shouldUpdate) {
  invariants.isFunction('queryFn', queryFn)
  invariants.isShouldUpdate(shouldUpdate)

  if (typeof shouldUpdate === 'string') {
    shouldUpdate = (thisProps, nextProps) => {
      return get(thisProps, shouldUpdate) !== get(nextProps, shouldUpdate)
    }
  }

  return (target) => {
    const displayName = target.displayName || target.name

    invariants.isNotWrapped(target, displayName)

    class KasiaConnectWpQueryComponent extends base(target) {
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
        const wrappedQueryFn = wrapQueryFn(queryFn, props, this.context.store.getState())
        return createQueryRequest(wrappedQueryFn)
      }

      _makePropsData () {
        const query = this._query()
        const state = this.props.wordpress
        if (!query || !query.complete || query.error) return {}
        else return findEntities(state.entities, state.keyEntitiesBy, query.entities)
      }
    }

    return connect(KasiaConnectWpQueryComponent)
  }
}
