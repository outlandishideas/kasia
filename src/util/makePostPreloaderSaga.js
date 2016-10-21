import { fork } from 'redux-saga/effects'

import { fetch } from '../redux/sagas'
import { createPostRequest } from '../redux/actions'
import { getContentType } from '../util/contentTypes'
import invariants from '../util/invariants'

/**
 * Make a preloader saga for single content type item.
 * @param {String} contentType Post content type
 * @param {String|Number|Function} id Post identifier
 * @param {Object} renderProps Render props object
 * @returns {Function} A single saga operation
 */
export function makePostPreloaderSaga (contentType, id, renderProps) {
  if (typeof contentType !== 'string') {
    throw new Error('Expecting contentType to be a string.')
  } else if (typeof id !== 'string' && typeof id !== 'number' && typeof id !== 'function') {
    throw new Error('Expecting identifier to be a string, number, or function.')
  }

  const identifier = typeof id === 'function' ? id(renderProps) : id
  const action = createPostRequest({ contentType, identifier })

  invariants.isValidContentType(getContentType(contentType), contentType, 'call to makePostPreloaderSaga')
  invariants.isIdentifierValue(identifier)

  return function * () {
    yield fork(fetch, action)
  }
}
