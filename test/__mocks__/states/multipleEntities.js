import postJson from '../../__fixtures__/wp-api-responses/post'
import bookJson from '../../__fixtures__/wp-api-responses/book'

const post2 = Object.assign({}, postJson, {
  id: postJson.id + 1,
  title: { rendered: 'new title' }
})

export default {
  wordpress: {
    __keyEntitiesBy: 'id',
    __nextQueryId: 0,
    queries: {},
    entities: {
      posts: {
        [postJson.id]: postJson,
        [postJson.id + 1]: post2
      },
      books: {
        [bookJson.id]: bookJson
      }
    }
  }
}
