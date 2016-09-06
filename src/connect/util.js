let id = 0

export function resetPreparedQueryId () {
  id = 0
}

export function nextPreparedQueryId () {
  return id++
}
