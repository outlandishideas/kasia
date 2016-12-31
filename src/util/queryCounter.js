let queryId = -1

export default {
  reset () {
    queryId = -1
  },
  next () {
    queryId += 1
    return queryId
  }
}
