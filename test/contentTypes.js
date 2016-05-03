jest.disableAutomock();

import merge from 'lodash.merge';

import configureStore from './util/configureStore';
import Plurality from '../src/constants/Plurality';

const builtInContentTypes = [
  'category',
  'comment',
  'media',
  'page',
  'post',
  'postRevision',
  'postType',
  'postStatus',
  'tag',
  'taxonomy',
  'user'
];

let store;

function createStore (options) {
  options = merge(options, { host: '' });
  store = configureStore(options).store;
}

function getConfig () {
  return store.getState().wordpress.config;
}

function makeContentTypeObj (single, plural, slug) {
  return {
    name: {
      canonical: single,
      [Plurality.SINGULAR]: single,
      [Plurality.PLURAL]: plural
    },
    slug: {
      [Plurality.SINGULAR]: `/${slug}/:id`,
      [Plurality.PLURAL]: `/${slug}`
    }
  };
}

describe('contentTypes', () => {
  describe('unhappy path', () => {
    builtInContentTypes.forEach(builtInType => {
      it(`throws an invariant exception when name is a built in type ${builtInType}`, () => {
        expect(() => {
          createStore({ contentTypes: [builtInType] });
        }).toThrowError(/taken/);
      });
    });
  });

  describe('happy path', () => {
    it('adds contentType to list', () => {
      createStore({ contentTypes: ['article'] });

      const config = getConfig();

      expect(config.contentTypes.article).toEqual(
        makeContentTypeObj('article', 'articles', 'articles')
      );
    });

    it('adds contentType to list with camelCased type', () => {
      createStore({ contentTypes: ['blogPost'] });

      const config = getConfig();

      expect(config.contentTypes.blogPost).toEqual(
        makeContentTypeObj('blogPost', 'blogPosts', 'blog-posts')
      );
    });

    it('maintains more than one contentType on list', () => {
      createStore({
        contentTypes: [
          'article',
          'book'
        ]
      });

      let config = getConfig();

      expect(config.contentTypes.article).toEqual(
        makeContentTypeObj('article', 'articles', 'articles')
      );

      expect(config.contentTypes.book).toEqual(
        makeContentTypeObj('book', 'books', 'books')
      );
    });

    it('adds contentType to list with custom pluralisation', () => {
      createStore({
        contentTypes: [{
          name: 'custom',
          namePlural: 'plural'
        }]
      });

      const config = getConfig();

      expect(config.contentTypes.custom).toEqual(
        makeContentTypeObj('custom', 'plural', 'plural')
      );
    });

    it('adds contentType to list with custom endpoint', () => {
      createStore({
        contentTypes: [{
          name: 'owl',
          requestSlug: 'parliament'
        }]
      });

      const config = getConfig();

      expect(config.contentTypes.owl).toEqual(
        makeContentTypeObj('owl', 'owls', 'parliament')
      );
    });
  });
});
