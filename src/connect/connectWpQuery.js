import React, { Component } from 'react'
import { connect } from 'react-redux'
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
 * Only inspect primitives by default.
 * Returning `undefined` makes isEqualWith fallback to built-in comparator.
 * @param {Object} thisProps Current props object
 * @param {Object} nextProps Next props object
 * @returns {Boolean}
 */
function defaultPropsComparator (thisProps, nextProps) {
  return isEqualWith(thisProps, nextProps, (value) => {
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

    const mapStateToProps = (state) => {
      invariants.hasWordpressObjectInStore(state)
      return { wordpress: state.wordpress }
    }

    class KasiaIntermediateComponent extends Component {
      static __kasia = true

      static makePreloader = (renderProps) => {
        const realQueryFn = (wpapi) => queryFn(wpapi, renderProps)
        const action = createQueryRequest({ queryFn: realQueryFn, prepared: true })
        return [fetch, action]
      }

      render () {
        const props = merge({}, this.props, this.reconcileWpData())
        return React.createElement(target, props)
      }

      componentWillMount () {
        const { _numPreparedQueries } = this.props.wordpress

        const _isNode = typeof this.props.__IS_NODE__ !== 'undefined'
          ? this.props.__IS_NODE__
          : __IS_NODE__

        if (_numPreparedQueries.length) {
          this.queryId = nextPreparedQueryId()

          if (!_isNode) {
            this.props.dispatch(subtractPreparedQueries())
          }
        } else {
          this.dispatchRequestAction(this.props)
        }
      }

      componentWillReceiveProps (nextProps) {
        // Nullify `wordpress` on props objects so that they aren't compared otherwise
        // the addition of a new query object each time will cause infinite dispatches
        const thisProps = merge({}, this.props, { wordpress: null })
        const _nextProps = merge({}, nextProps, { wordpress: null })

        // Make a request for new data if the current props and next props are different
        if (!propsComparatorFn(thisProps, _nextProps)) {
          this.dispatchRequestAction(_nextProps)
        }
      }

      // Dispatch a new data request action to fetch data according to the props
      dispatchRequestAction (props) {
        const wrappedQueryFn = (wpapi) => queryFn(wpapi, props)
        const action = createQueryRequest({ queryFn: wrappedQueryFn })

        this.queryId = props.wordpress._nextQueryId
        this.props.dispatch(action)
      }

      /**
       * Build an object of properties containing entity and query data maintained by Kasia.
       * @returns {Object} Props object
       */
      reconcileWpData () {
        const { queries, entities: _entities } = this.props.wordpress
        const query = queries[this.queryId]

        if (!query) {
          return {
            kasia: {
              query: { complete: false },
              entities: {}
            }
          }
        }

        const entities = findEntities(_entities, query.entities)

        return { kasia: { query, entities } }
      }
    }

    return connect(mapStateToProps)(KasiaIntermediateComponent)
  }
}
