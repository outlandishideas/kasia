const KASIA_URL = 'http://kasia.io'

function invariant (predicate, message, ...args) {
  if (!predicate) {
    const interpolated = args.reduce((str, arg) => str.replace(/%s/, arg), message)
    throw new Error('[kasia] ' + interpolated)
  }
}

export default {
  isObject: (name, value) => invariant(
    typeof value === 'object',
    'Expecting %s to be object, got "%s".',
    name, typeof value
  ),
  isString: (name, value) => invariant(
    typeof value === 'string',
    'Expecting %s to be string, got "%s".',
    name, typeof value
  ),
  isFunction: (name, value) => invariant(
    typeof value === 'function',
    'Expecting %s to be function, got "%s".',
    name, typeof value
  ),
  isPlugin: (idx, value) => invariant(
    typeof value === 'function',
    'Plugin at index %s is not a function, got "%s". ' +
    'Please file an issue with the plugin if you ' +
    'think there might be a problem with it.',
    idx, typeof value
  ),
  isArray: (name, value) => invariant(
    Array.isArray(value),
    'Expecting %s to be array, got "%s".',
    name, typeof value
  ),
  isBoolean: (name, value) => invariant(
    typeof value === 'object',
    'Expecting %s to be boolean, got "%s".',
    name, typeof value
  ),
  isShouldUpdate: (value) => invariant(
    typeof value === 'function' || (typeof value === 'string' && value.length),
    'Expecting shouldUpdate to be function or non-empty string, got "%s".',
    typeof value
  ),
  isWpApiInstance: (value = {}) => invariant(
    typeof value.registerRoute === 'function',
    'Expecting WP to be instance of `node-wpapi`.'
  ),
  isIdentifierArg: (identifier) => invariant(
    ['function', 'string', 'number'].indexOf(typeof identifier) > -1,
    'Expecting id given to connectWpPost to be function/string/number, got "%s".',
    typeof identifier
  ),
  isValidContentTypeObject: (obj) => invariant(
    typeof obj.name === 'string' &&
    typeof obj.plural === 'string' &&
    typeof obj.slug === 'string',
    'Invalid content type object. ' +
    `See documentation: ${KASIA_URL}.`
  ),
  isValidContentType: (contentTypeOptions, name, checkStr) => invariant(
    typeof contentTypeOptions !== 'undefined',
    'Content type "%s" is not recognised. ' +
    'Pass built-ins from `kasia/types`, e.g. `connectWpPost(Post, ...)`. ' +
    'Pass the name of custom content types, e.g. `connectWpPost("Book", ...)`. ' +
    'Check %s.',
    name, checkStr
  ),
  isNewContentType: (typesMap, contentType) => invariant(
    typesMap && !typesMap.get(contentType.name),
    'Content type with name "%s" already exists.',
    contentType.name
  ),
  isNotWrapped: (target, displayName) => invariant(
    !target.__kasia,
    '%s is already wrapped by Kasia.',
    displayName
  ),
  isIdentifierValue: (id, displayName) => invariant(
    typeof id === 'string' || typeof id === 'number',
    `The final identifier for ${displayName} is invalid. ` +
    'Expecting a string or number, got "%s".',
    typeof id
  ),
  hasWordpressObject: (wordpress) => invariant(
    wordpress,
    'No `wordpress` object on the store. ' +
    'Is your store configured correctly? ' +
    `See documentation ${KASIA_URL}.`,
    typeof wordpress
  ),
  isKeyEntitiesByOption: (keyEntitiesBy) => invariant(
    keyEntitiesBy === 'slug' || keyEntitiesBy === 'id',
    'Expecting keyEntitiesBy to be "slug" or "id", got "%s".',
    keyEntitiesBy
  ),
  isValidCacheStrategy: (strategy) => invariant(
    !strategy || (
      typeof strategy === 'object' &&
      typeof strategy.expires === 'number' &&
      typeof strategy.cacheId === 'string' &&
      (typeof strategy.invalidate === 'undefined' || typeof strategy.invalidate === 'boolean')
    ),
    'Expecting cacheStrategy retval to be object {cacheId:string, expires:number[, invalidate:boolean]}.'
  )
}
