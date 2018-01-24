import { INITIAL_STATE } from '../../../src/redux/reducer'
import { completeRequest } from '../../../src/redux/actions'
import { ActionTypes } from '../../../src/constants'
import { acknowledgeReducer, createCompleteReducer } from '../../../src/redux/reducer'
import post from '../../../test/__fixtures__/wp-api-responses/post'
import modifyResponse from 'wp-api-response-modify'
import kasia from '../../../src'
import plugin from '../'

jest.disableAutomock()

let id = 0
let state = INITIAL_STATE

describe('kasia-plugin-wp-api-response-modify', () => {
  let kasiaReducer

  it('is accepted by kasia', () => {
    expect(() => {
      const obj = kasia({
        wpapi: {
          registerRoute: () => {}
        },
        plugins: [
          [plugin, {
            // pass in from src so we are testing against the version being dev'd
            _ActionTypes: ActionTypes,
            _createCompleteReducer: createCompleteReducer
          }]
        ]
      })

      kasiaReducer = obj.kasiaReducer
    }).not.toThrow()
  })

  it('intercepts completeReducer and modifies entity in store', () => {
    state = acknowledgeReducer(state, {
      request: {id}
    })
    const action = completeRequest({
      id,
      result: post
    })
    const newState = kasiaReducer.wordpress(state, action)
    expect(newState === state).toEqual(false)
    state = newState
    //TODO work out some way of removing non-camel props
    const modifiedResp = Object.assign({}, post, modifyResponse(post))
    expect(state.entities.posts[post.id]).toEqual(modifiedResp)
  })
})
