import { Request, RequestTypes } from './constants/ActionTypes'

/**
 * Initiate a request for a single entity from the WP-API.
 * @param {String} id Query identifier
 * @param {String} contentType The content type name
 * @param {String|Number} identifier The entity identifier, slug or ID
 * @returns {Object} Action object
 */
export const createPostRequest = (id, { contentType, identifier }) =>
  ({ type: Request.Create, request: RequestTypes.Post, id, contentType, identifier })

/**
 * Initiate an arbitrary request to the WP-API.
 * @param {String} id Query identifier
 * @param {Function} queryFn Function that returns WP-API request
 * @returns {Object} Action object
 */
export const createQueryRequest = (id, { queryFn }) =>
  ({ type: Request.Create, request: RequestTypes.Query, id, queryFn })

/**
 * Place the result of a successful request on the store
 * @param {String} id Query identifier
 * @param {Object} data Raw WP-API response data
 */
export const completeRequest = (id, data) =>
  ({ type: Request.Complete, id, data })

/**
 * Update the record of a request with the error returned from a failed response.
 * @param {String} id Query identifier
 * @param {Error} error Error from failed request
 */
export const failRequest = (id, error) =>
  ({ type: Request.Fail, id, error })
