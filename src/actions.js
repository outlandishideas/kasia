import { Request, RequestTypes, SubtractPreparedQueries } from './constants/ActionTypes'

/**
 * Initiate a request for a single entity from the WP-API.
 * @param {String} contentType The content type name
 * @param {String|Number} identifier The entity identifier, slug or ID
 * @param {Boolean} [target] Is this a prepared query? The target component that
 *                           can pick up the query on client
 * @returns {Object} Action object
 */
export const createPostRequest = ({ contentType, identifier, target = false }) =>
  ({ type: Request.Create, request: RequestTypes.Post, contentType, identifier, target })

/**
 * Initiate an arbitrary request to the WP-API.
 * @param {Function} queryFn Function that returns WP-API request
 * @param {Boolean} [target] Is this a prepared query? The target component that
 *                           can pick up the query on client
 * @returns {Object} Action object
 */
export const createQueryRequest = ({ queryFn, target = false }) =>
  ({ type: Request.Create, request: RequestTypes.Query, queryFn, target })

/**
 * Place the result of a successful request on the store
 * @param {Number} id Query identifier
 * @param {Object} data Raw WP-API response data
 * @param {Boolean} [target] Is this a prepared query? The target component that
 *                           can pick up the query on client
 */
export const completeRequest = ({ id, data, target = false }) =>
  ({ type: Request.Complete, id, data, target })

/**
 * Update the record of a request with the error returned from a failed response.
 * @param {Number} id Query identifier
 * @param {Error} error Error from failed request
 * @param {Boolean} [target] Is this a prepared query? The target component that
 *                           can pick up the query on client
 */
export const failRequest = ({ id, error, target = false }) =>
  ({ type: Request.Fail, id, error, target })

// Remove an ID from the prepared query ID array.
export const subtractPreparedQueries = () =>
  ({ type: SubtractPreparedQueries })
