import merge from 'lodash.merge'

import postJson from '../../__fixtures__/wp-api-responses/post'
import bookJson from '../../__fixtures__/wp-api-responses/book'

import { INITIAL_STATE } from '../../../src/redux/reducer'

export default {
  wordpress: merge(INITIAL_STATE, {
    queries: {
      '0': { complete: true, OK: true, entities: [postJson.id] },
      '1': { complete: true, OK: true, entities: [postJson.id + 1] },
      '2': { complete: true, OK: true, entities: [bookJson.id] }
    },
    entities: {
      posts: {
        [String(postJson.id)]: postJson,
        [String(postJson.id + 1)]: merge({}, postJson, { title: 'new title' })
      },
      books: {
        [String(bookJson.id)]: bookJson
      }
    }
  })
}
