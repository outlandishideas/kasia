import React, { Component } from 'react'
import { connect } from 'react-redux'
import find from 'lodash.find'

import invariants from '../invariants'
import { createRequest } from '../actions'
import { fetchSaga } from '../sagas'
import { getContentType } from '../contentTypes'
import { REQUEST_TYPES } from '../ActionTypes'

/**
 * Connect a component to arbitrary data from the WP-API.
 * @params {Function} queryFn Function that returns a wpapi query, should accept a single argument `api`
 * @returns {Function}
 */
export default function connectWpQuery (queryFn) {
  invariants.isFunction(queryFn, 'queryFn')

  return (target) => {
    const targetName = target.displayName || target.name

    invariants.isNotWrapped(target, targetName)

    function mapStateToProps (state, ownProps) {

    }

    class PepperoniComponentWrapper extends Component {
      render () {
        const targetProps = merge({}, this.props, { query: this.state.query })
        return React.createElement(target, targetProps)
      }

      dispatch () {
        const action = createRequest(REQUEST_TYPES.Query, { queryFn })
        this.setState({ queryId: action.id })
        this.props.dispatch(action)
      }

      componentWillMount () {
        this.dispatch()
      }
    }

    PepperoniComponentWrapper.__pepperoni = true

    PepperoniComponentWrapper.fetchData = (renderProps) => {

    }

    return connect(mapStateToProps)(PepperoniComponentWrapper)
  }
}

/**
 * Create a Redux `mapStateToProps` function for a component wrapped by Pepperoni.
 * @param {String} contentType The name of content type
 * @param {Function} identifier Function that returns the entity's identifier
 * @returns {Function}
 */
function makeMapStateToProps (contentType, identifier) {
  return (state, ownProps) => {
    const contentTypeOptions = getContentType(contentType)

    // Validate content type here as registration of custom types is complete
    invariants.isValidContentType(contentTypeOptions, contentType)

    const realIdent = identifier(ownProps)
    const contentTypeCollection = state.wordpress.entities[contentTypeOptions.plural]
    const isSlugIdent = typeof realIdent === 'string'

    let entity = null

    if (contentTypeCollection) {
      entity = isSlugIdent
        ? find(contentTypeCollection, (obj) => obj.slug === realIdent)
        : contentTypeCollection[realIdent]
    }

    return {
      wordpress: state.wordpress,
      data: queryResult
    }
  }
}
