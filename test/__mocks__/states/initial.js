export default (keyEntitiesBy = 'id') => ({
  wordpress: {
    __keyEntitiesBy: keyEntitiesBy,
    __nextQueryId: 0,
    queries: {},
    entities: {}
  }
})
