let queryId = -1

export default {
  observeNext () {
    return queryId + 1
  },
  reset () {
    queryId = -1
  },
  next () {
    queryId += 1
    return queryId
  }
}
