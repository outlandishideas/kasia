import { getContentType } from '../contentTypes'
import { createPostRequest, createQueryRequest } from '../actions'
import { fetch } from '../sagas'
import invariants from '../invariants'

/**
 * Produce a universal preloader function for a connected WpQuery component.
 * @param {String} id Query identifier
 * @param {String} contentType The content type name
 * @param {Function} getIdentifier Function that derives entity identifier from props
 * @param {String} componentName Name of component preloader is created for
 * @returns {Function} Function that returns saga operation information
 */
export function makeWpPostPreloaderFn (id, contentType, getIdentifier, componentName) {
  return (renderProps) => {
    invariants.isValidContentType(getContentType(contentType), contentType, componentName)
    const identifier = getIdentifier(renderProps)
    const action = createPostRequest(id, { contentType, identifier })
    return [fetch, action]
  }
}

/**
 * Produce a universal preloader function for a connected WpQuery component.
 * @param {String} id Query identifier
 * @param {Function} queryFn Function that returns a WP-API request
 * @returns {Function} Function that returns saga operation information
 */
export function makeWpQueryPreloaderFn (id, queryFn) {
  return (renderProps) => {
    const realQueryFn = (wpapi) => queryFn(wpapi, renderProps)
    const action = createQueryRequest(id, { queryFn: realQueryFn })
    return [fetch, action]
  }
}
