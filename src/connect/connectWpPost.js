import React, { Component } from 'react'
import { connect } from 'react-redux'
import merge from 'lodash.merge'

import idGen from './idGen'
import invariants from '../invariants'
import { createPostRequest } from '../actions'
import { getContentType } from '../contentTypes'
import { makeWpPostPreloaderFn } from './preloaders'

/**
 * IDs of queries created through the preloader.
 * @type {Array<Number>}
 */
const queryIds = []

/**
 * Find an entity in `entities` with the given `identifier`.
 * @param {Object} entities Entity collection
 * @param {String|Number} identifier Entity ID or slug
 * @returns {Object}
 */
function findEntity (entities, identifier) {
  if (typeof identifier === 'number') {
    return entities[identifier]
  }

  let entity = null

  Object.keys(entities).forEach((key) => {
    if (entities[key].slug === identifier) {
      entity = entities[key]
      return false
    }
  })

  return entity
}

/**
 * Connect a component to a single entity from the WP-API.
 *
 * Built-in content type, derived slug identifier:
 * ```js
 * const { Page } from 'kasia/types'
 * connectWordPress(Page, (props) => props.params.slug)(Component)
 * ```
 *
 * Built-in content type, explicit ID identifier:
 * ```js
 * const { Post } from 'kasia/types'
 * connectWordPress(Post, 16)(Component)
 * ```
 *
 * Custom content type, derived identifier:
 * ```js
 * connectWordPress('News', (props) => props.params.slug)(Component)
 * ```
 *
 * @params {String} contentType The content type of the data to fetch from WP-API
 * @params {Function|String|Number} id The entity's ID or slug or a function that derives either from props
 * @returns {Function} Decorated component
 */
export default function connectWpPost (contentType, id) {
  return (target) => {
    const targetName = target.displayName || target.name
    const getIdentifier = (props) => typeof id === 'function' ? id(props) : id

    invariants.isNotWrapped(target, targetName)
    invariants.isString('contentType', contentType)
    invariants.isIdentifier(id)

    const mapStateToProps = (state, ownProps) => ({
      wordpress: state.wordpress
    })

    class KasiaIntermediateComponent extends Component {
      static __kasia = true

      static makePreloader = () => {
        const id = idGen()
        queryIds.push(id)
        return makeWpPostPreloaderFn(id, contentType, getIdentifier, targetName)
      }

      render () {
        invariants.isValidContentType(getContentType(contentType), contentType, targetName)
        const props = merge({}, this.props, this.reconcileKasiaData(this.props))
        return React.createElement(target, props)
      }

      /**
       * Build an object of properties containing entity and query data maintained by Kasia.
       * @params {Object} Props object to use for reconciliation
       * @returns {Object} Props object
       */
      reconcileKasiaData (props) {
        const { plural, name } = getContentType(contentType)
        const query = props.wordpress.queries[this.queryId]

        if (!query) {
          return {
            kasia: {
              query: { complete: false },
              [name]: null
            }
          }
        }

        const entityCollection = props.wordpress.entities[plural] || {}
        const entityId = getIdentifier(props)

        return {
          kasia: {
            query,
            [name]: findEntity(entityCollection, entityId)
          }
        }
      }

      // Dispatch a new request action to fetch data according to the props
      dispatch (props) {
        const identifier = getIdentifier(props)
        const action = createPostRequest(this.queryId, { contentType, identifier })
        this.props.dispatch(action)
      }

      componentWillMount () {
        this.queryId = queryIds.length ? queryIds.shift() : idGen()
        this.dispatch(this.props)
      }

      componentWillReceiveProps (nextProps) {
        const { name } = getContentType(contentType)
        const shouldDispatch = getIdentifier(nextProps) !== getIdentifier(this.props)
        const nextBuiltProps = this.reconcileKasiaData(nextProps)

        // Make a request for new data if:
        //  - the identifier has changed
        //  - an entity cannot be derived from the store using `nextProps`
        if (shouldDispatch && !nextBuiltProps.kasia[name]) {
          this.queryId = queryIds.length ? queryIds.shift() : idGen()
          this.dispatch(nextProps)
        }
      }
    }

    return connect(mapStateToProps)(KasiaIntermediateComponent)
  }
}
