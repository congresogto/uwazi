export const searchSchema = {
  properties: {
    query: {
      properties: {
        filters: { type: 'object' },
        types: { type: 'array', items: [{ type: 'string' }] },
        _types: { type: 'array', items: [{ type: 'string' }] },
        fields: { type: 'array', items: [{ type: 'string' }] },
        allAggregations: { type: 'boolean' },
        aggregations: { type: 'string' },
        order: { type: 'string', enum: ['asc', 'desc'] },
        sort: { type: 'string' },
        limit: { type: 'number' },
        from: { type: 'number' },
        searchTerm: { anyOf: [{ type: 'string' }, { type: 'number' }] },
        includeUnpublished: { type: 'boolean' },
        userSelectedSorting: { type: 'boolean' },
        treatAs: { type: 'string' },
        unpublished: { type: 'boolean' },
        select: { type: 'array', items: [{ type: 'string' }] },
        geolocation: { type: 'boolean' },
      },
    },
  },
};
