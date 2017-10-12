import React from 'react'
import get from 'lodash.get'
import PropTypes from 'prop-types'
import isNode from 'is-node-fn'
import { connect as reduxConnect } from 'react-redux'
import { call } from 'redux-saga/effects'

import debug from './util/debug'
import contentTypesManager from './util/content-types-manager'
import invariants from './invariants'
import findEntities from './util/find-entities'
import { createPostRequest, createQueryRequest } from './redux/actions'
import { fetch } from './redux/sagas'

// Is a component the first Kasia component to mount?
let nextQueryId = 0

/** Reset first mount flag, should be called before SSR of each request. */
export function rewind () {
  nextQueryId = 0
}

/** Get entity identifier: either `id` as-is or the result of calling `id(props)`. */
export function identifier (displayName, id, props) {
  const realId = typeof id === 'function' ? id(props) : id
  invariants.isIdentifierValue(realId, displayName)
  return realId
}

/** Wrap `queryFn` in a function that takes the node-wpapi instance. */
export function wrapQueryFn (queryFn, props, state) {
  return function * (wpapi) {
    return yield call(queryFn, wpapi, props, state)
  }
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
      store: PropTypes.object.isRequired
    }

    /** Make request for new data from WP-API. */
    _requestWpData (props) {
      const action = this._getRequestWpDataAction(props)
      this.props.dispatch(action)
    }

    /** Find the query for this component and its corresponding data
     *  and return props object containing them. */
    _reconcileWpData (props) {
      const query = this._query()
      const fallbackQuery = { complete: false, OK: null }

      const data = query && query.preserve
        ? query.result
        : this._makePropsData(props)

      if (query && query.error) {
        console.log(`[kasia] error in query for ${displayName}:`)
        console.log(query.error)
      }

      debug(`content for ${displayName} on \`props.kasia.${this.dataKey}\``)

      return {
        kasia: {
          query: query || fallbackQuery,
          [this.dataKey]: data
        }
      }
    }

    _query () {
      return this.props.wordpress.queries[this.queryId]
    }

    componentWillMount () {
      const state = this.props.wordpress
      const queryId = this.queryId = nextQueryId++
      const query = state.queries[queryId]

      // We found a prepared query matching queryId, use it
      if (query && query.prepared) {
        debug(`found prepared data for ${displayName} at queryId=${queryId}`)
      } else if (!isNode()) {
        // Query found but it is not prepared, request data with new queryId
        this._requestWpData(this.props)
      }
    }

    componentWillReceiveProps (nextProps) {
      const willUpdate = this._shouldUpdate(this.props, nextProps, this.context.store.getState())
      if (willUpdate) {
        debug(displayName, 'sending request for new data with props:', nextProps)
        this.queryId = this.props.wordpress.__nextQueryId
        this._requestWpData(nextProps)
      }
    }

    render () {
      const props = Object.assign({},
        this.props,
        this._reconcileWpData(this.props)
      )
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
        return [fetch, action]
      }

      _getRequestWpDataAction (props) {
        debug(displayName, 'connectWpPost request with props:', props)
        const realId = identifier(displayName, id, props)
        return createPostRequest(contentType, realId)
      }

      _makePropsData (props) {
        const query = this._query()

        if (!query || !query.complete || query.error) {
          return null
        }

        if (query.preserve) {
          return query.result
        }

        const entities = this.props.wordpress.entities[typeConfig.plural]

        if (entities) {
          const keys = Object.keys(entities)
          const realId = identifier(displayName, id, props)
          //
          // console.log(entities)
          // console.log(realId)

          for (let i = 0, len = keys.length; i < len; i++) {
            const entity = entities[keys[i]]
            if (entity.id === realId || entity.slug === realId) {
              return entity
            }
          }
        }

        return null
      }

      _shouldUpdate (thisProps, nextProps) {
        // Make a request for new data if entity not in store or the identifier has changed
        const entity = this._makePropsData(nextProps)
        const identChanged = identifier(displayName, id, nextProps) !== identifier(displayName, id, thisProps)
        return !entity && identChanged
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
 * @param {Function|String|Object} [shouldUpdate] Inspect props to determine if new data request is made
 * @param {Object} [opts] Options object
 * @param {Function|String|Object} [opts.shouldUpdate] See `shouldUpdate` docs
 * @param {Boolean} [opts.preserve] Preserve result of query and pass this untouched to component (no normalisation)
 * @returns {Function} Decorated component
 */
export function connectWpQuery (queryFn, shouldUpdate, opts = {}) {
  if (typeof shouldUpdate === 'object') {
    opts = shouldUpdate
    shouldUpdate = opts.shouldUpdate
  }

  shouldUpdate = shouldUpdate || (() => false)

  invariants.isObject('opts', opts)
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
        const action = createQueryRequest(wrappedQueryFn, opts.preserve)
        return [fetch, action]
      }

      _getRequestWpDataAction (props) {
        debug(displayName, 'connectWpQuery request with props:', props)
        const wrappedQueryFn = wrapQueryFn(queryFn, props, this.context.store.getState())
        return createQueryRequest(wrappedQueryFn, opts.preserve)
      }

      _makePropsData () {
        const query = this._query()
        const state = this.props.wordpress
        if (!query || !query.complete || query.error) {
          return {}
        } else if (opts.preserve) {
          return query.result
        } else {
          return findEntities(
            state.entities,
            state.__keyEntitiesBy,
            query.entities
          )
        }
      }
    }

    return connect(KasiaConnectWpQueryComponent)
  }
}
