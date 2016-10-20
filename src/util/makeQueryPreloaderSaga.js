import { fetch } from '../redux/sagas'
import { createQueryRequest } from '../redux/actions'

/**
 * Make a preloader saga for an arbitrary WP API query.
 * @param {Function} queryFn Query function that accepts `wpapi` API
 * @param {Object} renderProps Render props object
 * @param {Boolean} [state] State object
 * @returns {Function} A single saga operation
 */
export default function makeQueryPreloaderSaga (queryFn, renderProps, state = null) {
  if (typeof queryFn !== 'function') {
    throw new Error('Expecting queryFn to be a function.')
  }

  const realQueryFn = (wpapi) => queryFn(wpapi, renderProps, state)
  const action = createQueryRequest({ queryFn: realQueryFn })

  return function * () {
    yield effects.fork(fetch, action)
  }
}
