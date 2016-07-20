import invariant from 'invariant'
import isArray from 'lodash.isArray'

export default {
  isString: (value, name) => invariant(
    typeof value === 'string',
    `Expecting ${name} to be a string, got "%s".`,
    typeof value
  ),
  isArray: (value, name) => invariant(
    isArray(value),
    `Expecting ${name} to be an array, got "%s".`,
    typeof value
  ),
  isFunction: (value, name) => invariant(
    typeof value === 'function',
    `Expecting ${name} to be a function, got "%s".`,
    typeof value
  ),
  isIdentifier: (identifier) => invariant(
    typeof identifier === 'function' ||
    typeof identifier === 'string' ||
    typeof identifier === 'number',
    'Expecting identifier to be function/string/number, got "%s"',
    typeof identifier
  ),
  isValidContentTypeObject: (obj, i) => invariant(
    typeof obj.name === 'string' &&
    typeof obj.plural === 'string' &&
    typeof obj.slug === 'string',
    `Invalid content type object at position ${i}, see docs.`
  ),
  isValidContentType: (contentTypeOptions, name) => invariant(
    typeof contentTypeOptions !== 'undefined',
    'Content type "%s" is not recognised. ' +
    'Built-in content types are available at `pepperoni/types`. ' +
    'Pass the `name` of custom content types.',
    name
  ),
  isNewContentType: (allTypes, contentType) => invariant(
    typeof allTypes[contentType.name] === 'undefined',
    'Content type with name "%s" already exists.',
    contentType.name
  ),
  isNotWrapped: (target, targetName) => invariant(
    !target.__pepperoni,
    'The component "%s" is already wrapped by Pepperoni.',
    targetName
  )
}
