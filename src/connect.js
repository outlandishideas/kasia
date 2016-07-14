import React, { Component } from 'react'
import { connect } from 'react-redux'
import find from 'lodash.find'
import merge from 'lodash.merge'

import Plurality from './constants/Plurality'
import invariants from './invariants'
import { createRequest } from './creators'
import { fetchResource } from './sagas'

/**
 * Connect a component to data from the WP-API.
 *
 * Derived content type, explicit identifier:
 * ```js
 * connectWordPress('my-page-slug')(Component) // slug
 * connectWordPress(1337)(Component) // ID
 * ```
 *
 * Derived content type, derived identifier:
 * ```js
 * connectWordPress((props) => props.params.slug)(Component)
 * ```
 *
 * Explicit content type, derived identifier:
 * ```js
 * const { Page } from 'pepperoni/contentTypes'
 * connectWordPress(Page, (props) => props.params.slug)(Component)
 * ```
 *
 * Explicit custom content type, derived identifier:
 * ```js
 * connectWordPress('News', (props) => props.params.slug)(Component)
 * ```
 *
 * @params {String|Function|Number} contentType The content type of the data to fetch from WP-API
 * @params {String|Function|Number} [identifier] The subject identifier of the content
 * @returns {Function}
 */
export default function connectWordPress (contentType, identifier) {
  return (target) => {
    const targetName = target.displayName ? target.displayName : target.name
    const switchIdentifier = !identifier && typeof contentType !== 'string'
    const realIdentifier = switchIdentifier ? contentType : identifier

    invariants.alreadyWrappedByPepperoni(target, targetName)

    if (switchIdentifier) {
      invariants.targetMinifiedWithoutDisplayName(target)
    }

    const getContentTypeOptions = (contentTypes) => {
      const contentTypeOptions = find(contentTypes, (options) => options.name.canonical.indexOf(contentType) !== -1)
      invariants.badContentType(contentTypeOptions, contentType)
      return contentTypeOptions
    }

    const getIdentifier = (props) => String(
      typeof realIdentifier === 'function'
        ? realIdentifier(props)
        : realIdentifier)

    let hasDispatchedRequestAction = false
    let hasWarnedNoEntity = false

    function mapStateToProps (state, ownProps) {
      const { contentTypes } = state.wordpress.config

      const subject = getIdentifier(ownProps)
      const contentTypeOpts = getContentTypeOptions(contentTypes)

      const nameSingular = contentTypeOpts.name[Plurality.SINGULAR]
      const namePlural = contentTypeOpts.name[Plurality.PLURAL]
      const contentTypeCollection = state.wordpress.entities[namePlural]

      // Anything that is not numeric is treated as a slug
      const isSlugSubject = !/^\d+$/.test(subject)

      let entity = null

      if (contentTypeCollection) {
        entity = isSlugSubject
          ? find(contentTypeCollection, (obj) => obj.slug === subject)
          : contentTypeCollection[subject]
      }

      if (!entity) {
        // Look in the failed entities instead
        const failedContentTypeCollection = state.wordpress.failedEntities[namePlural]

        if (failedContentTypeCollection && failedContentTypeCollection[subject]) {
          // Return an entity object with no identifying properties
          entity = merge({}, failedContentTypeCollection[subject])

          delete entity.id
          delete entity.slug

          if (!hasWarnedNoEntity) {
            hasWarnedNoEntity = true
            console.warn(`Pepperoni: subject was not found with identifier \`${subject}\``)
          }
        }
      }

      return {
        wordpress: state.wordpress,
        [nameSingular]: entity
      }
    }

    class PepperoniComponentWrapper extends Component {
      render () {
        const { contentTypes } = this.props.wordpress.config

        const subject = getIdentifier(this.props)
        const contentTypeOpts = getContentTypeOptions(contentTypes)

        const nameSingular = contentTypeOpts.name[Plurality.SINGULAR]
        const canonicalName = contentTypeOpts.name.canonical

        if (!this.props[nameSingular] && !hasDispatchedRequestAction) {
          hasDispatchedRequestAction = true
          this.props.dispatch(createRequest(canonicalName, subject))
        }

        return React.createElement(target, this.props)
      }

      componentWillUpdate (nextProps) {
        if (getIdentifier(nextProps) !== getIdentifier(this.props)) {
          hasDispatchedRequestAction = false
          hasWarnedNoEntity = false
        }
      }
    }

    PepperoniComponentWrapper.__pepperoni = true

    PepperoniComponentWrapper.fetchData = (renderProps, store) => {
      const { contentTypes } = store.wordpress.config

      const subject = getIdentifier(renderProps)
      const contentTypeOpts = getContentTypeOptions(contentTypes)
      const contentType = contentTypeOpts.name.canonical

      return [[fetchResource, { contentType, subject }]]
    }

    return connect(mapStateToProps)(PepperoniComponentWrapper)
  }
}
