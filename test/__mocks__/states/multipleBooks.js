import merge from 'lodash.merge'

import bookJson from '../../__fixtures__/wp-api-responses/book'

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
        [String(bookJson.id)]: bookJson,
        [String(bookJson.id + 1)]: merge({},
          bookJson,
          { id: bookJson.id + 1, slug: 'new-slug' }
        )
      }
    }
  })
}
