import React, { Component } from 'react'
import { connect } from 'react-redux'
import merge from 'lodash.merge'

import { fetch } from '../sagas'
import { getContentType } from '../contentTypes'
import { createPostRequest, subtractPreparedQueries } from '../actions'
import { nextPreparedQueryId } from './util'
import invariants from '../invariants'
import isNode from '../isNode'

const __IS_NODE__ = isNode()

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

  const id = Object.keys(entities).find((key) => {
    return entities[key].slug === identifier
  })

  return id ? entities[id] : null
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

    const getIdentifier = (props) => {
      const realId = typeof id === 'function' ? id(props) : id
      invariants.isIdentifierValue(realId)
      return realId
    }

    invariants.isNotWrapped(target, targetName)
    invariants.isString('contentType', contentType)
    invariants.isIdentifierArg(id)

    const mapStateToProps = (state) => {
      invariants.hasWordpressObjectInStore(state)
      return { wordpress: state.wordpress }
    }

    class KasiaIntermediateComponent extends Component {
      static __kasia = true

      static makePreloader = (renderProps) => {
        invariants.isValidContentType(getContentType(contentType), contentType, targetName)
        const identifier = getIdentifier(renderProps)
        const action = createPostRequest({ contentType, identifier, prepared: true })
        return [fetch, action]
      }

      render () {
        invariants.isValidContentType(getContentType(contentType), contentType, targetName)
        const props = merge({}, this.props, this.reconcileWpData(this.props))
        return React.createElement(target, props)
      }

      componentWillMount () {
        const { _numPreparedQueries } = this.props.wordpress

        const _isNode = typeof this.props.__IS_NODE__ !== 'undefined'
          ? this.props.__IS_NODE__
          : __IS_NODE__

        if (_numPreparedQueries) {
          this.queryId = nextPreparedQueryId()

          if (!_isNode) {
            this.props.dispatch(subtractPreparedQueries())
          }
        } else {
          this.dispatchRequestAction(this.props)
        }
      }

      /**
       * Make a request for new data if the identifier has changed or
       * an entity cannot be derived from the store using `nextProps`.
       * @param {Object} nextProps
       */
      componentWillReceiveProps (nextProps) {
        const { name } = getContentType(contentType)
        const nextBuiltProps = this.reconcileWpData(nextProps)
        const changedIdentifier = getIdentifier(nextProps) !== getIdentifier(this.props)
        const cannotDeriveEntityFromNextProps = !nextBuiltProps.kasia[name]

        if (changedIdentifier && cannotDeriveEntityFromNextProps) {
          this.dispatchRequestAction(nextProps)
        }
      }

      /**
       * Dispatch a new request action to fetch data according to the props.
       * @param {Object} props Props object
       */
      dispatchRequestAction (props) {
        const identifier = getIdentifier(props)
        const action = createPostRequest({ contentType, identifier })

        this.queryId = props.wordpress._nextQueryId
        this.props.dispatch(action)
      }

      /**
       * Build an object of properties containing entity and query data maintained by Kasia.
       * @params {Object} props Props object to use for reconciliation
       * @returns {Object} Props object
       */
      reconcileWpData (props) {
        const { queries } = props.wordpress
        const { plural, name } = getContentType(contentType)
        const query = queries[this.queryId]

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
    }

    return connect(mapStateToProps)(KasiaIntermediateComponent)
  }
}
