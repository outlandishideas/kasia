import React, { Component } from 'react'
import isEqualWith from 'lodash.isequalwith'
import merge from 'lodash.merge'

import { fetch } from '../sagas'
import { createQueryRequest, subtractPreparedQueries } from '../actions'
import { nextPreparedQueryId } from './util'
import invariants from '../invariants'
import isNode from '../isNode'

const __IS_NODE__ = isNode()

/**
 * Filter `entities` to contain only those whose ID is in `identifiers`.
 * @param {Object} entities Entities by type, e.g. { posts: {}, ... }
 * @param {Array} identifiers IDs of the entities to pick
 * @returns {Object}
 */
function findEntities (entities, identifiers) {
  identifiers = identifiers.map(String)

  return Object.keys(entities).reduce((reduced, entityTypeName) => {
    Object.keys(entities[entityTypeName]).forEach((entityId) => {
      const obj = entities[entityTypeName][entityId]

      if (identifiers.indexOf(entityId) !== -1) {
        reduced[entityTypeName] = reduced[entityTypeName] || {}
        reduced[entityTypeName][entityId] = obj
      }
    })

    return reduced
  }, {})
}

/**
 * Determine if a value is a primitive. (http://bit.ly/2bf3FYJ)
 * @param {*} value Value to inspect
 * @returns {Boolean} Whether value is primitive
 */
function isPrimitive (value) {
  const type = typeof value
  return value == null || (type !== 'object' && type !== 'function')
}

/**
 * Determines if new request for data should be made when props are received. Only
 * inspect primitives by default. Returning `undefined` makes isEqualWith fallback
 * to built-in comparator.
 * @param {Object} thisProps Current props object
 * @param {Object} nextProps Next props object
 * @returns {Boolean}
 */
function defaultPropsComparator (thisProps, nextProps) {
  return !isEqualWith(thisProps, nextProps, (value) => {
    return isPrimitive(value) ? undefined : true
  })
}

/**
 * Connect a component to arbitrary data from a WP-API query. By default
 * the component will request new data via the given `queryFn` if the
 * `propsComparatorFn` returns true. The default property comparison
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
 * @params {Function} propsComparatorFn Function that determines if new data should be requested by inspecting props
 * @returns {Function} Decorated component
 */
export default function connectWpQuery (queryFn, propsComparatorFn = defaultPropsComparator) {
  invariants.isFunction('queryFn', queryFn)
  invariants.isFunction('propsComparatorFn', propsComparatorFn)

  return (target) => {
    const targetName = target.displayName || target.name

    invariants.isNotWrapped(target, targetName)

    return class KasiaIntermediateComponent extends Component {
      static __kasia = true

      static contextTypes = {
        store: React.PropTypes.object.isRequired
      }

      static makePreloader = (renderProps, state) => {
        const realQueryFn = (wpapi) => queryFn(wpapi, renderProps, state)
        const action = createQueryRequest({ queryFn: realQueryFn, prepared: true })
        return [fetch, action]
      }

      render () {
        const props = merge({}, this.props, this.reconcileWpData())
        return React.createElement(target, props)
      }

      componentWillMount () {
        const { numPreparedQueries } = this.context.store.getState().wordpress.__kasia__
        const isNode = typeof this.props.__IS_NODE__ !== 'undefined'
          ? this.props.__IS_NODE__
          : __IS_NODE__

        if (numPreparedQueries) {
          this.queryId = nextPreparedQueryId()

          if (!isNode) {
            this.context.store.dispatch(subtractPreparedQueries())
          }
        } else {
          this.dispatchRequestAction(this.props)
        }
      }

      componentWillReceiveProps (nextProps) {
        // Make a request for new data if the current props and next props are different
        if (propsComparatorFn(this.props, nextProps)) {
          this.dispatchRequestAction(nextProps)
        }
      }

      // Dispatch a new data request action to fetch data according to the props
      dispatchRequestAction (props) {
        const wrappedQueryFn = (wpapi) => queryFn(wpapi, props, this.context.store.getState())
        const action = createQueryRequest({ queryFn: wrappedQueryFn })

        this.queryId = this.context.store.getState().wordpress.__kasia__.nextQueryId
        this.context.store.dispatch(action)
      }

      /**
       * Build an object of properties containing entity and query data maintained by Kasia.
       * @returns {Object} Props object
       */
      reconcileWpData () {
        const { queries, entities: _entities } = this.context.store.getState().wordpress
        const query = queries[this.queryId]

        if (!query) {
          return {
            kasia: {
              query: { complete: false },
              entities: {}
            }
          }
        }

        const entities = query.entities
          ? findEntities(_entities, query.entities)
          : {}

        return { kasia: { query, entities } }
      }
    }
  }
}
