import React from 'react'
import PropTypes from 'prop-types'
import isNode from 'is-node-fn'

import invariants from '../invariants'
import debug from '../util/debug'
import { incrementNextQueryId } from '../redux/actions'

let nextClientQueryId = 0

export function getNextClientQueryId () {
  return nextClientQueryId++
}

export function _rewindNextClientQueryId () {
  nextClientQueryId = 0
}

/**
 * Base connect component.
 * @param {Function} target
 * @param {String} dataKey
 * @param {*} fallbackDataValue
 * @param {Function} [cacheStrategy]
 * @returns {KasiaConnectedComponent}
 */
export default function base ({ target, dataKey, fallbackDataValue, cacheStrategy }) {
  const displayName = target.displayName || target.name

  if (!cacheStrategy) {
    // default is no caching
    cacheStrategy = () => false
  }

  invariants.isFunction('opts.cacheStrategy', cacheStrategy)

  return class KasiaConnectedComponent extends React.PureComponent {
    static __kasia__ = true

    static WrappedComponent = target

    static cacheStrategy (...args) {
      const strategy = cacheStrategy(...args)
      invariants.isValidCacheStrategy(strategy)
      return strategy
    }

    static contextTypes = {
      store: PropTypes.object.isRequired
    }

    /** Make request for new data from WP-API. */
    _requestWpData (props, reuseQueryId = false) {
      const action = this._getRequestWpDataAction(props)

      if (reuseQueryId) {
        action.request.id = this.queryId
      } else {
        if (isNode()) {
          action.request.id = this.props.wordpress.__nextQueryId
        } else {
          action.request.id = getNextClientQueryId()
        }
        this.queryId = action.request.id
      }

      this.props.dispatch(action)
    }

    /** Find the query for this component and its corresponding data
     *  and return props object containing them. */
    _reconcileWpData (props, query) {
      let data = fallbackDataValue

      if (query) {
        if (query.complete && query.OK) {
          if (query.preserve) {
            data = query.result
          } else {
            data = this._makePropsData(props, query)
          }
        } else if (query.error) {
          console.log(`[kasia] error in query for ${displayName}:`)
          console.log(query.error)
        }
      }

      debug(`${displayName} has content on \`props.kasia.${dataKey}\``)

      return {
        query: query || {
          complete: false,
          OK: null
        },
        [dataKey]: data
      }
    }

    componentWillMount () {
      const { __nextQueryId, queries } = this.props.wordpress

      if (isNode()) {
        this.queryId = __nextQueryId
      } else {
        this.queryId = getNextClientQueryId()
      }

      const query = queries[this.queryId]

      debug(`${displayName} will mount with queryId=${this.queryId}`)

      if (query && query.prepared) {
        debug(`${displayName} has prepared data at queryId=${this.queryId}`)
        if (isNode()) {
          this.props.dispatch(incrementNextQueryId())
        }
      } else {
        debug(`${displayName} initiating request in componentWillMount`)
        this._requestWpData(this.props, true)
      }
    }

    componentWillReceiveProps (nextProps) {
      const { queries } = this.props.wordpress
      const query = queries[this.queryId]

      if (query && query.complete) {
        const willUpdate = this._shouldUpdate(this.props, nextProps, this.context.store.getState())

        if (willUpdate) {
          debug(`${displayName} initiating request: queryId=${this.queryId}, props: ${nextProps}`)
          this._requestWpData(nextProps)
        }
      }
    }

    render () {
      const query = this.props.wordpress.queries[this.queryId]
      const kasia = this._reconcileWpData(this.props, query)
      const props = Object.assign({}, this.props, { kasia })
      return React.createElement(target, props)
    }
  }
}
