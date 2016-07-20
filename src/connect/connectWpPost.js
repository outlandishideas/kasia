import React, { Component } from 'react'
import { connect } from 'react-redux'
import find from 'lodash.find'
import merge from 'lodash.merge'
import isFunction from 'lodash.isfunction'

import invariants from '../invariants'
import { createRequest } from '../actions'
import { fetch } from '../sagas'
import { getContentType } from '../contentTypes'
import { REQUEST_TYPES } from '../ActionTypes'

/**
 * Connect a component to a single entity from the WP-API.
 *
 * Built-in content type, derived identifier:
 * ```js
 * const { Page } from 'pepperoni/types'
 * connectWordPress(Page, (props) => props.params.slug)(Component)
 * ```
 *
 * Built-in content type, explicit identifier:
 * ```js
 * const { Post } from 'pepperoni/types'
 * connectWordPress(Post, 16)(Component)
 * ```
 *
 * Custom content type, derived identifier:
 * ```js
 * connectWordPress('News', (props) => props.params.slug)(Component)
 * ```
 *
 * @params {String} contentType The content type of the data to fetch from WP-API
 * @params {Function|String|Number} identifier The entity's id or slug or a function that derives either from props
 * @returns {Function}
 */
export default function connectWpPost (contentType, identifier) {
  invariants.isString(contentType)
  invariants.isIdentifier(identifier)

  return (target) => {
    const targetName = target.displayName || target.name
    const getIdentifier = (props) => isFunction(identifier) ? identifier(props) : identifier
    const mapStateToProps = makeMapStateToProps(contentType, getIdentifier)

    invariants.isNotWrapped(target, targetName)

    class PepperoniComponentWrapper extends Component {
      render () {
        const targetProps = merge({}, this.props, { query: this.state.query })
        return React.createElement(target, targetProps)
      }

      dispatch () {
        const identifier = getIdentifier(this.props)
        const action = createRequest(REQUEST_TYPES.Single, { contentType, identifier })
        this.setState({ queryId: action.id })
        this.props.dispatch(action)
      }

      componentWillMount () {
        this.dispatch()
      }

      componentWillReceiveProps (nextProps) {
        const contentTypeOptions = getContentType(contentType)
        const shouldDispatch = getIdentifier(nextProps) === getIdentifier(this.props)
        
        if (shouldDispatch && !nextProps[contentTypeOptions.name]) {
          this.dispatch()
        }
      }
    }

    PepperoniComponentWrapper.__pepperoni = true

    PepperoniComponentWrapper.fetchData = (renderProps) => {
      const contentTypeOptions = getContentType(contentType)
      const identifier = getIdentifier(renderProps)
      invariants.isValidContentType(contentTypeOptions, contentType)
      return [[fetch, createRequest(REQUEST_TYPES.Single, { contentType, identifier })]]
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
      [contentTypeOptions.name]: entity
    }
  }
}
