/* global process:false */

export default () => Boolean(
  typeof process !== 'undefined' &&
  process.versions &&
  process.versions.node
)
