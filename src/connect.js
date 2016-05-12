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

function invariantCannotDeriveContentType (targetName, contentTypeOptions) {
  invariant(
    contentTypeOptions,
    'Could not derive content type from name "%s". ' +
    'Pass built-ins using `pepperoni/contentTypes`. For example, ContentTypes.POST. ' +
    'Custom content types should be registered at initialisation and passed in using registered name.',
    targetName
  )
}

function invariantContentTypeNotRecognised (contentTypeOptions, contentType) {
  invariant(
    contentTypeOptions,
    'The content type "%s" is not recognised. ' +
    'Register custom content types during initialisation.',
    contentType
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
 * @params {String|Function|Number} contentType The content type of the data to fetch from WP-API
 * @params {String|Function|Number} [identifier] The subject identifier of the content
 * @returns {Function}
 */
export default function connectWordPress (contentType, identifier) {
  let hasDispatchedRequestAction = false;
  let hasWarnedNoEntity = false;

  return (target) => {
    const targetName = target.displayName
      ? target.displayName
      : target.name

    invariant(
      !target.__pepperoni,
      'The component "%s" is already wrapped by Pepperoni.',
      targetName
    )

    let getContentTypeOptions = (contentTypes) => {
      const contentTypeOptions = find(contentTypes, { name: { canonical: contentType } })
      invariantContentTypeNotRecognised(contentTypeOptions, contentType)
      return contentTypeOptions
    }

    let getIdentifier = (props) => typeof identifier === 'function'
      ? identifier(props)
      : identifier

    if (typeof contentType !== 'string' && typeof identifier === 'undefined') {
      let contentTypeOptions

      invariantTargetMinifiedWithoutDisplayName(target)

      getContentTypeOptions = (contentTypes) => {
        if (!contentTypeOptions) {
          contentTypeOptions = deriveContentTypeOptions(targetName, contentTypes)
          invariantCannotDeriveContentType(targetName, contentTypeOptions)
        }
        return contentTypeOptions
      }

      getIdentifier = (props) => typeof contentType === 'function'
        ? contentType(props)
        : contentType
    }

    function mapStateToProps (state, ownProps) {
      const { contentTypes } = state.wordpress.config

      const subject = getIdentifier(ownProps)
      const contentTypeOpts = getContentTypeOptions(contentTypes)

      const isSlugSubject = isNaN(Number(subject))
      const nameSingular = contentTypeOpts.name[Plurality.SINGULAR]
      const namePlural = contentTypeOpts.name[Plurality.PLURAL]
      const contentTypeCollection = state.wordpress.entities[namePlural]

      let entity = null

      if (contentTypeCollection) {
        entity = isSlugSubject
          ? find(contentTypeCollection, (obj) => obj.slug === subject)
          : contentTypeCollection[String(subject)]
      }

      if (!entity) {
        // look in the failed entities instead
        const failedContentTypeCollection = state.wordpress.failedEntities[namePlural]
        if (failedContentTypeCollection && failedContentTypeCollection[subject]) {
          
          // return an entity object with no identifying properties
          entity = {...failedContentTypeCollection[subject]};
          delete entity.id;
          delete entity.slug;

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
        const sameIdentifier = getIdentifier(nextProps) === getIdentifier(this.props);

        if (!sameIdentifier) {
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
