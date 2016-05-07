import React, { Component } from 'react'
import { connect } from 'react-redux'
import invariant from 'invariant'
import find from 'lodash.find'

import Plurality from './constants/Plurality'
import { createRequest } from './creators'
import { fetchResource } from './sagas'
import { deriveContentTypeOptions } from './contentTypes'

function wowSuchFunction () {}

const isMinified = wowSuchFunction.name !== 'wowSuchFunction'

function invariantTargetMinifiedWithoutDisplayName (target) {
  invariant(
    !isMinified || (isMinified && !target.displayName),
    'Pepperoni cannot derive the content type from a minified component. ' +
    'Add a static property `displayName` to the component.'
  )
}

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
 * @params {String|Function|Number} contentType The content type of the data to fetch from WP-API.
 * @params {String|Function|Number} identifier The subject identifier of the content.
 *
 * @returns {Function}
 */
export default function connectWordPress (contentType, identifier) {
  return (target) => {
    const targetName = target.displayName
      ? target.displayName
      : target.name

    invariant(
      !target.__pepperoni,
      'The component "%s" is already wrapped by Pepperoni.',
      targetName
    )

    let getContentTypeOptions = (contentTypes) => contentTypes[contentType]

    let getIdentifier = (props) => typeof identifier === 'function'
      ? identifier(props)
      : identifier

    if (contentType && typeof identifier === 'undefined') {
      let contentTypeOptions

      invariantTargetMinifiedWithoutDisplayName(target)

      getContentTypeOptions = (contentTypes) => !contentTypeOptions
          ? contentTypeOptions = deriveContentTypeOptions(targetName, contentTypes)
          : contentTypeOptions

      getIdentifier = (props) => typeof contentType === 'function'
        ? contentType(props)
        : contentType
    }

    function mapStateToProps (state, ownProps) {
      const { contentTypes, entityKeyPropName } = state.wordpress.config

      const subject = getIdentifier(ownProps)
      const contentTypeOpts = getContentTypeOptions(contentTypes)
      const nameSingular = contentTypeOpts.name[Plurality.SINGULAR]
      const namePlural = contentTypeOpts.name[Plurality.PLURAL]
      const contentTypeCollection = state.wordpress.entities[namePlural]

      return {
        wordpress: state.wordpress,
        [nameSingular]: contentTypeCollection
          ? entityKeyPropName !== 'id'
            ? find(contentTypeCollection, (obj) => obj[entityKeyPropName] === subject)
            : contentTypeCollection[subject]
          : null
      }
    }

    class PepperoniComponentWrapper extends Component {
      render () {
        const { contentTypes } = this.props.wordpress.config

        const subject = getIdentifier(this.props)
        const contentTypeOpts = getContentTypeOptions(contentTypes)
        const nameSingular = contentTypeOpts.name[Plurality.SINGULAR]
        const canonicalName = contentTypeOpts.name.canonical

        if (!this.props[nameSingular]) {
          this.props.dispatch(
            createRequest(canonicalName, subject)
          )
        }

        return React.createElement(target, this.props)
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
