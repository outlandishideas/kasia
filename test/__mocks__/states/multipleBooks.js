import merge from 'lodash.merge'

import bookJson from '../../__fixtures__/wp-api-responses/book'

export default {
  wordpress: {
    __keyEntitiesBy: 'id',
    queries: {
      '0': {
        id: 0,
        complete: true,
        OK: true,
        entities: [bookJson.id, bookJson.id + 1]
      }
    },
    entities: {
      books: {
        [bookJson.id]: bookJson,
        [bookJson.id + 1]: merge({}, bookJson, { id: bookJson.id + 1, slug: 'new-slug' })
      }
    }
  }
}
