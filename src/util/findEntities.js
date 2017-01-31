const isDef = (v) => typeof v !== 'undefined'

/** Filter `entities` to contain only those whose `keyToInspect` is in `identifiers`. */
export default function findEntities (entities, keyToInspect, identifiers) {
  identifiers = identifiers.map(String)

  const reduced = {}

  for (const entityTypeName in entities) {
    const entitiesOfType = entities[entityTypeName]

    for (const key in entitiesOfType) {
      const entity = entitiesOfType[key]

      // Try to find entity by `keyToInspect` but fall back on id and then slug as
      // for entities that don't have an `id` identifiers will contain their slug
      // and vice-versa for entities that don't have a `slug`
      let entityId = isDef(entity[keyToInspect])
        ? entity[keyToInspect]
        : isDef(entity.id) ? entity.id : entity.slug

      entityId = String(entityId)

      if (identifiers.indexOf(entityId) !== -1) {
        reduced[entityTypeName] = reduced[entityTypeName] || {}
        reduced[entityTypeName][key] = entity
      }
    }
  }

  return reduced
}
