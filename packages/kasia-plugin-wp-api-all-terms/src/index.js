import * as effects from 'redux-saga/effects'
import merge from 'lodash.merge'

const REQUEST_TERMS = 'kasia/terms/REQUEST_TERMS'
const RECEIVE_DATA = 'kasia/terms/RECEIVE_DATA'

export const fetchTerms = () =>
  ({ type: REQUEST_TERMS })

export function makePreloader (WP) {
  return () => fetchResource(
    WP,
    Object.assign({}, fetchTerms(), { prepared: true })
  )
}

function fetch (WP, action) {
  switch (action.type) {
    case REQUEST_TERMS:
      return WP.allTerms().get()
    default:
      throw new Error(`Unknown request type "${action.request}".`)
  }
}

function * fetchResource (WP, action) {
  const { id, type } = action
  const data = yield effects.call(fetch, WP, action)
  yield effects.put({ type: RECEIVE_DATA, request: type, data, id })
}

export default function (WP, config) {
  WP.allTerms = WP.registerRoute(config.route || 'wp/v2', 'all-terms')

  return {
    reducers: {
      [RECEIVE_DATA]: (state, action) => {
        return merge({}, state, { terms: action.data })
      }
    },
    sagas: [function * fetchTermsSaga () {
      while (true) {
        const action = yield effects.take((action) => action === REQUEST_TERMS)
        yield fetchResource(WP, action)
      }
    }]
  }
}
