import React from 'react'
import PropTypes from 'prop-types'
import isNode from 'is-node-fn'

import debug from '../util/debug'
import { incrementNextQueryId } from '../redux/actions'

/**
 * Base connect component.
 * @param {Function} target
 * @param {String} dataKey
 * @param {*} fallbackDataValue
 * @returns {KasiaConnectedComponent}
 */
export default function base (target, dataKey, fallbackDataValue) {
  const displayName = target.displayName || target.name

  return class KasiaConnectedComponent extends React.PureComponent {
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
      const state = this.props.wordpress
      const queryId = this.queryId = state.__nextQueryId
      const query = state.queries[queryId]

      debug(`${displayName} will mount with queryId=${queryId}`)

      if (query && query.prepared) {
        debug(`${displayName} has prepared data at queryId=${queryId}`)
        this.props.dispatch(incrementNextQueryId())
      } else if (!isNode()) {
        debug(`${displayName} initiating request in componentWillMount`)
        this._requestWpData(this.props)
      }
    }

    componentWillReceiveProps (nextProps) {
      const willUpdate = this._shouldUpdate(this.props, nextProps, this.context.store.getState())
      if (willUpdate) {
        this.queryId = this.props.wordpress.__nextQueryId
        debug(`${displayName} initiating request: queryId=${this.queryId}, props: ${nextProps}`)
        this._requestWpData(nextProps)
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
