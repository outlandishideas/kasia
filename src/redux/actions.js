import { ActionTypes } from '../constants'

/** Initiate a request for a single entity from the WP-API. */
export const createPostRequest = ({ contentType, identifier, cacheStrategy }) => ({
  type: ActionTypes.RequestCreatePost,
  request: {
    contentType,
    identifier,
    cacheStrategy
  }
})

/** Initiate an arbitrary request to the WP-API. */
export const createQueryRequest = ({ queryFn, preserve = false, cacheStrategy = null }) => ({
  type: ActionTypes.RequestCreateQuery,
  request: {
    queryFn,
    preserve,
    cacheStrategy
  }
})

/** Acknowledge a create* request by placing record of it on the store. */
export const acknowledgeRequest = (request) => ({
  type: ActionTypes.RequestAck,
  request
})

/** Place the result of a successful request on the store */
export const completeRequest = ({ id, result, fromCache = false }) => ({
  type: ActionTypes.RequestComplete,
  request: {
    id,
    result,
    fromCache
  }
})

/** Update the record of a request with the error returned from a failed response. */
export const failRequest = ({ id, error }) => ({
  type: ActionTypes.RequestFail,
  request: {
    id,
    error
  }
})

/** Increment the next query ID. **/
export const incrementNextQueryId = () => ({
  type: ActionTypes.IncrementNextQueryId
})

/** Reset the queryId counter to zero. */
export const rewind = () => ({
  type: ActionTypes.RewindQueryCounter
})
