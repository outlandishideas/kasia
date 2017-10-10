let queryId = 0

export default {
  get value () {
    return queryId
  },
  reset () {
    queryId = 0
  },
  next () {
    return queryId++
  }
}
