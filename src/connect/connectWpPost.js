import debug from '../util/debug'
import contentTypesManager from '../util/content-types-manager'
import invariants from '../invariants'
import base from './base'
import { identifier, connect } from './util'
import { createPostRequest } from '../redux/actions'
import { fetch } from '../redux/sagas'

/**
 * Connect a component to a single entity from WordPress.
 *
 * @example Built-in content type, derived slug identifier:
 * ```js
 * const { Page } from 'kasia/types'
 * connectWordPress(Page, (props) => props.params.slug)(Component)
 * ```
 *
 * @example Built-in content type, explicit ID identifier:
 * ```js
 * const { Post } from 'kasia/types'
 * connectWordPress(Post, 16)(Component)
 * ```
 *
 * @example Custom content type, derived identifier:
 * ```js
 * connectWordPress('News', (props) => props.params.slug)(Component)
 * ```
 *
 * @param {String} contentType Content type of the WP entity to fetch
 * @param {Function|String|Number} id Entity's ID/slug/a function that derives either from props
 * @param {Function} [shouldUpdate] Receives thisProps & nextProps and returns
 *                                  bool indicating whether data should be re-fetched
 * @param {Object} [opts] Options object
 * @param {Function} [opts.cacheStrategy] Function returning caching strategy object
 * @returns {Function} Decorated component
 */
export default function connectWpPost (contentType, id, shouldUpdate, opts = {}) {
  invariants.isString('contentType', contentType)
  invariants.isIdentifierArg(id)
  invariants.isObject('opts', opts)

  if (shouldUpdate) {
    invariants.isShouldUpdate(shouldUpdate)
  }

  const typeConfig = contentTypesManager.get(contentType)

  return (target) => {
    const displayName = target.displayName || target.name

    invariants.isNotWrapped(target, displayName)

    const baseCls = base({
      target,
      dataKey: contentType,
      fallbackDataValue: null,
      cacheStrategy: opts.cacheStrategy
    })

    class KasiaConnectWpPostComponent extends baseCls {
      static preload (props, state, req, res) {
        debug(displayName, 'connectWpPost preload with props:', props)
        invariants.isValidContentType(typeConfig, contentType, `${displayName} component`)
        const action = createPostRequest({
          contentType,
          identifier: identifier(displayName, id, props),
          cacheStrategy: baseCls.cacheStrategy(props, state, req, res)
        })
        return [fetch, action]
      }

      _getRequestWpDataAction (props) {
        debug(displayName, 'connectWpPost request with props:', props)
        const state = this.context.store.getState()
        return createPostRequest({
          contentType,
          identifier: identifier(displayName, id, props),
          cacheStrategy: baseCls.cacheStrategy(props, state)
        })
      }

      _makePropsData (props) {
        const entities = this.props.wordpress.entities[typeConfig.plural]

        if (entities) {
          const lookupId = identifier(displayName, id, props)
          const idKey = typeof lookupId === 'string' ? 'slug' : 'id'

          for (const key in entities) {
            if (entities.hasOwnProperty(key)) {
              const entity = entities[key]
              if (entity[idKey] == lookupId) { // eslint-disable-line eqeqeq
                return entity
              }
            }
          }
        }

        return null
      }

      _shouldUpdate (...args) {
        if (shouldUpdate) {
          return shouldUpdate(...args)
        } else {
          const [ thisProps, nextProps ] = args
          const entity = this._makePropsData(nextProps)
          const identChanged = identifier(displayName, id, nextProps) !== identifier(displayName, id, thisProps)
          return !entity && identChanged
        }
      }

      componentWillMount () {
        invariants.isValidContentType(typeConfig, contentType, `${displayName} component`)
        super.componentWillMount()
      }
    }

    return connect(KasiaConnectWpPostComponent)
  }
}
