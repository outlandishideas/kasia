jest.disableAutomock();

import merge from 'lodash.merge';
import cloneDeep from 'lodash.clonedeep';

import ContentTypes from '../constants/ContentTypes'
import EntityKeyPropNames from '../constants/EntityKeyPropNames';
import WpApiResponses from './fixtures/wp-api-responses'
import normalise from '../normalise';

function makeNormaliserTestData (contentType) {
  const first = WpApiResponses[contentType];
  const second = merge({}, cloneDeep(first), { id: first.id + 1, slug: first.slug + '1' });
  const multiple = [first, second];
  return { first, second, multiple };
}

const tests = {
  [ContentTypes.CATEGORY]: {
    expectedEntities: ['categories'],
    bySlug: true,
    byId: true
  },
  [ContentTypes.COMMENT]: {
    expectedEntities: ['comments'],
    bySlug: true,
    byId: false
  },
  [ContentTypes.MEDIA]: {
    expectedEntities: ['media', 'users'],
    bySlug: true,
    byId: true
  },
  [ContentTypes.PAGE]:  {
    expectedEntities: ['pages', 'users', 'media'],
    bySlug: true,
    byId: true
  },
  [ContentTypes.POST]:  {
    expectedEntities: ['posts', 'users', 'media'],
    bySlug: true,
    byId: true
  },
  [ContentTypes.POST_STATUS]:  {
    expectedEntities: ['postStatuses'],
    bySlug: true,
    byId: false
  }
};

Object.keys(tests).forEach(contentType => {
  describe(`${contentType} normaliser`, () => {
    const { first, second, multiple } = makeNormaliserTestData(contentType);
    const { expectedEntities, bySlug, byId } = tests[contentType];

    if (byId) {
      it(`should normalise a single ${contentType} by ID`, () => {
        const flattened = normalise(contentType, first, EntityKeyPropNames.ID, true);
        expect(flattened.result).toEqual(first.id);
        expect(Object.keys(flattened.entities)).toEqual(expectedEntities);
      });

      it(`should normalise multiple ${contentType} by ID`, () => {
        const flattened = normalise(contentType, multiple, EntityKeyPropNames.ID, true);
        expect(flattened.result).toEqual([first.id, second.id]);

      });
    }

    if (bySlug) {
      it(`should normalise a single ${contentType} by SLUG`, () => {
        const flattened = normalise(contentType, first, EntityKeyPropNames.SLUG, true);
        expect(flattened.result).toEqual(first.slug);
        expect(Object.keys(flattened.entities)).toEqual(expectedEntities);
      });

      it(`should normalise multiple ${contentType} by SLUG`, () => {
        const flattened = normalise(contentType, multiple, EntityKeyPropNames.SLUG, true);
        expect(flattened.result).toEqual([first.slug, second.slug]);
      });
    }
  });
});
