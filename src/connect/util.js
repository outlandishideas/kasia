import { call } from 'redux-saga/effects'
import { connect as reduxConnect } from 'react-redux'

import invariants from '../invariants'

/** Get entity identifier: either `id` as-is or the result of calling `id(props)`. */
export function identifier (displayName, id, props) {
  const realId = typeof id === 'function' ? id(props) : id
  invariants.isIdentifierValue(realId, displayName)
  return realId
}

/** Wrap component in react-redux connect. */
export function connect (cls) {
  return reduxConnect(({ wordpress }) => {
    invariants.hasWordpressObject(wordpress)
    return { wordpress }
  })(cls)
}

/** Wrap `queryFn` in a function that takes the node-wpapi instance. */
export function wrapQueryFn (queryFn, props, state) {
  return function * (wpapi) {
    return yield call(queryFn, wpapi, props, state)
  }
}
