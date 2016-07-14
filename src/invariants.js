import invariant from 'invariant'

import { QueryableBySlug } from './constants/ContentTypes'

function wowSuchFunction () {}

const isMinified = wowSuchFunction.name !== 'wowSuchFunction'

export default {
  hostNotString: (host) => invariant(
    typeof host === 'string' && host.length > 0,
    'Expecting host to be a string, got "%s".',
    typeof host
  ),
  alreadyWrappedByPepperoni: (target, targetName) => invariant(
    !target.__pepperoni,
    'The component "%s" is already wrapped by Pepperoni.',
    targetName
  ),
  targetMinifiedWithoutDisplayName: (target) => invariant(
    !isMinified || (isMinified && !target.displayName),
    'Pepperoni cannot derive the content type from a minified component. ' +
    'Add a static property `displayName` to the component.'
  ),
  badContentType: (contentTypeOptions, contentType) => invariant(
    contentTypeOptions,
    'Content type "%s" is not recognised. ' +
    'Built-in content types are available at `pepperoni/contentTypes`. ' +
    'Custom content types should be registered at initialisation.',
    contentType
  ),
  badCustomContentTypeName: (options) => invariant(
    typeof options === 'string' || typeof options.name === 'string',
    'Expecting custom content type name to be a string, got "%s".',
    typeof (options.name ? options.name : options)
  ),
  notQueryableBySlug: (subject, name) => invariant(
    QueryableBySlug.indexOf(name) !== -1,
    'Got a slug ("%s") as the identifier, but Pepperoni cannot query the content type "%s" by slug. ' +
    'Content types queryable by slug in Pepperoni are: %s. ' +
    'For other content types, provide the slug as a query parameter in `options.query`.',
    subject,
    name,
    QueryableBySlug.join(', ')
  )
}
