export default function getKeys (target) {
  if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
    return Reflect.ownKeys(target.prototype);
  } else {
    const keys = Object.getOwnPropertyNames(target.prototype);
    return typeof Object.getOwnPropertySymbols === 'function'
      ? keys.concat(Object.getOwnPropertySymbols(target.prototype))
      : keys;
  }
}
