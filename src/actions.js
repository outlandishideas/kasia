import shortid from 'shortid'

import { REQUEST } from './ActionTypes'

export const createRequest = (requestType, options) => ({
  /** the action type */
  type: REQUEST.Create,
  /** unique identifier for the wpapi query */
  id: shortid.generate(),
  /** Single|Query, wpapi query is derived if Single */
  requestType,
  /** action options */
  options
})

export const putRequest = (id, contentType) =>
  ({ type: REQUEST.Put, id, contentType })

export const failRequest = (id, error) =>
  ({ type: REQUEST.Fail, id, error })

export const completeRequest = (id, data) =>
  ({ type: REQUEST.Complete, id, data })
