/* global jest:false, expect:false */
jest.disableAutomock()

import { wrapQueryFn } from '../../src/connect'
import { call } from 'redux-saga/effects'

function * testSaga() {
  return true
}

const props = { props: true }
const state = { state: true }
const wpapi = { wpapi: true }

describe('wrapQueryFn', () => {
  const wrapped = wrapQueryFn(testSaga, props, state)
  const saga = wrapped(wpapi)

  it('should yield a call with correct arguments', () => {
    expect(saga.next().value.CALL.args).toEqual(
      call(wrapped, wpapi, props, state).CALL.args
    )
  })

  it('should return the result of the call', () => {
    expect(saga.next(props).value).toEqual(props)
  })
})
