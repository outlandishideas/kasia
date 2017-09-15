let queryId = 0

export default {
  observeNext () {
    return queryId
  },
  reset () {
    queryId = 0
  },
  next () {
    return queryId++
  }
}
