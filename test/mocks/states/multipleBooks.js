import modifyResponse from 'wp-api-response-modify'
import merge from 'lodash.merge'

import bookJson from '../../mocks/fixtures/wp-api-responses/book'

import { INITIAL_STATE } from '../../../src/redux/reducer'

export default {
  wordpress: merge(INITIAL_STATE, {
    queries: {
      0: {
        complete: true,
        OK: true,
        entities: [bookJson.id]
      }
    },
    entities: {
      books: {
        [String(bookJson.id)]: modifyResponse(bookJson),
        [String(bookJson.id + 1)]: merge({},
          modifyResponse(bookJson),
          { id: bookJson.id + 1, slug: 'new-slug' }
        )
      }
    }
  })
}
