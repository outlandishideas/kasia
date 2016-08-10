import invariant from 'invariant'

const nodeWpApiGitHubUrl = 'http://bit.ly/2adfKKg'

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
  isWpApiInstance: (value = {}) => invariant(
    typeof value.registerRoute === 'function',
    'Expecting WP to be instance of `node-wpapi`. ' +
    `See ${nodeWpApiGitHubUrl} for docs.`
  ),
  isIdentifier: (identifier) => invariant(
    typeof identifier === 'function' ||
    typeof identifier === 'string' ||
    typeof identifier === 'number',
    'Expecting identifier to be function/string/number, got "%s"',
    typeof identifier
  ),
  isValidContentTypeObject: (obj = {}) => invariant(
    typeof obj.name === 'string' &&
    typeof obj.plural === 'string' &&
    typeof obj.slug === 'string',
    // TODO add in bit.ly link to docs
    'Invalid content type object, see documentation.'
  ),
  isValidContentType: (contentTypeOptions, name, componentName) => invariant(
    typeof contentTypeOptions !== 'undefined',
    'Content type "%s" is not recognised. ' +
    'Pass built-ins from `kasia/types`, e.g. Post. ' +
    'Pass the `name` of custom content types, e.g. "Book". ' +
    'See the %s component.',
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
  noWPInstance: (WP) => invariant(!WP, 'A WP instance is already set.')
}
