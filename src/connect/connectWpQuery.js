import React from 'react'
import get from 'lodash.get'

import debug from '../util/debug'
import invariants from '../invariants'
import findEntities from '../util/find-entities'
import base from './base'
import { wrapQueryFn, connect } from './util'
import { createQueryRequest } from '../redux/actions'
import { fetch } from '../redux/sagas'

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
export default function connectWpQuery (queryFn, shouldUpdate, opts = {}) {
  if (typeof shouldUpdate === 'object') {
    opts = shouldUpdate
    shouldUpdate = opts.shouldUpdate
  }

  invariants.isObject('opts', opts)
  invariants.isFunction('queryFn', queryFn)

  if (shouldUpdate) {
    invariants.isShouldUpdate(shouldUpdate)
  }

  if (typeof shouldUpdate === 'string') {
    shouldUpdate = (thisProps, nextProps) => {
      return get(thisProps, shouldUpdate) !== get(nextProps, shouldUpdate)
    }
  }

  return (target) => {
    const displayName = target.displayName || target.name

    invariants.isNotWrapped(target, displayName)

    class KasiaConnectWpQueryComponent extends base(target, 'data', {}) {
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

      _makePropsData (_, query) {
        const state = this.props.wordpress
        return findEntities(
          state.entities,
          query.entities,
          state.__keyEntitiesBy
        )
      }

      _shouldUpdate (...args) {
        if (shouldUpdate) {
          return shouldUpdate(...args)
        } else {
          return false
        }
      }
    }

    return connect(KasiaConnectWpQueryComponent)
  }
}
