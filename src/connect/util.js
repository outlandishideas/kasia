export const nextPreparedQueryId = (function () {
  let id = 0
  return () => id++
})()
