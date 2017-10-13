import React from 'react'
import PropTypes from 'prop-types'
import isNode from 'is-node-fn'

import debug from '../util/debug'
import { nextQueryId } from './util'

export default function base (target) {
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
      const queryId = this.queryId = nextQueryId()
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
