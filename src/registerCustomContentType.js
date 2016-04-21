const customContentTypes = {};

export default function repressRegisterCustomContentType (name, {
  namePlural = null,
  requestSlug = null
}= {}) {
  if (typeof name !== 'string') {
    throw new Error('Expecting name of Custom Content Type to be a string.');
  }

  namePlural = namePlural || name + 's';
  requestSlug = requestSlug || name;

  return customContentTypes[name] = {
    name,
    namePlural,
    requestSlug
  };
};
