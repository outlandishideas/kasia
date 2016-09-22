import invariant from 'invariant'

const nodeWpApiGitHubUrl = 'http://bit.ly/2adfKKg'
const kasiaGitHubUrl = 'http://bit.ly/2bg268P'

export default {
  isString: (name, value) => invariant(
    typeof value === 'string',
    'Expecting %s to be string, got %s',
    name,
    typeof value
  ),
  isFunction: (name, value) => invariant(
    typeof value === 'function',
    'Expecting %s to be function, got %s',
    name,
    typeof value
  ),
  isArray: (name, value) => invariant(
    Array.isArray(value),
    'Expecting %s to be array, got %s',
    name,
    typeof value
  ),
  isObject: (name, value) => invariant(
    typeof value === 'object',
    'Expecting %s to be object, got %s',
    name,
    typeof value
  ),
  isWpApiInstance: (value = {}) => invariant(
    typeof value.registerRoute === 'function',
    'Expecting WP to be instance of `node-wpapi`. ' +
    `See ${nodeWpApiGitHubUrl} for docs.`
  ),
  isIdentifierArg: (identifier) => invariant(
    typeof identifier === 'function' ||
    typeof identifier === 'string' ||
    typeof identifier === 'number',
    'Expecting id given to connectWpPost to be function/string/number, got "%s"',
    typeof identifier
  ),
  isValidContentTypeObject: (obj) => invariant(
    typeof obj.name === 'string' &&
    typeof obj.plural === 'string' &&
    typeof obj.slug === 'string',
    'Invalid content type object. ' +
    `See documentation ${kasiaGitHubUrl}.`
  ),
  isValidContentType: (contentTypeOptions, name, componentName) => invariant(
    typeof contentTypeOptions !== 'undefined',
    'Content type "%s" is not recognised. ' +
    'Pass built-ins from `kasia/types`, e.g. Post. ' +
    'Pass the `name` of custom content types, e.g. "Book". ' +
    'Check %s.',
    name,
    componentName
  ),
  isNewContentType: (allTypes = [], contentType) => invariant(
    typeof allTypes[contentType.name] === 'undefined',
    'Content type with name "%s" already exists.',
    contentType.name
  ),
  isNotWrapped: (target = () => {}, targetName) => invariant(
    !target.__kasia,
    'The component "%s" is already wrapped by Kasia.',
    targetName
  ),
  noWPInstance: (WP) => invariant(
    !WP,
    'setWP called multiple times.'
  ),
  isIdentifierValue: (id) => invariant(
    typeof id === 'string' || typeof id === 'number',
    'The final identifier is invalid. ' +
    'Expecting a string or number, got %s.',
    typeof id
  ),
  hasWordpressObjectInStore: (store) => invariant(
    Boolean(store.wordpress),
    'No `wordpress` object on the store. ' +
    'Is your store configured correctly? ' +
    `See documentation ${kasiaGitHubUrl}`,
    typeof store.wordpress
  ),
  queryErrorFree: (query, targetName) => invariant(
    query && !query.error,
    'Ignoring query %s. ' +
    'Error: "%s". ' +
    'Check connectWp* decorator for %s.',
    query.id,
    query.error,
    targetName
  )
}
