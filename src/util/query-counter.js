let queryId = -1

export default {
  current () {
    return queryId
  },
  reset () {
    queryId = -1
  },
  next () {
    queryId += 1
    return queryId
  }
}
