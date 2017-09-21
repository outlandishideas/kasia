import { ActionTypes } from '../constants'

/** Initiate a request for a single entity from the WP-API. */
export const createPostRequest = (contentType, identifier) =>
  ({ type: ActionTypes.RequestCreatePost, contentType, identifier })

/** Initiate an arbitrary request to the WP-API. */
export const createQueryRequest = (queryFn, preserve) =>
  ({ type: ActionTypes.RequestCreateQuery, queryFn, preserve })

/** Acknowledge a create* request by placing record of it on the store. */
export const acknowledgeRequest = (action) =>
  ({ ...action, type: ActionTypes.RequestAck })

/** Place the result of a successful request on the store */
export const completeRequest = (id, data) =>
  ({ type: ActionTypes.RequestComplete, id, data })

/** Update the record of a request with the error returned from a failed response. */
export const failRequest = (id, error) =>
  ({ type: ActionTypes.RequestFail, id, error })
