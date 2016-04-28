jest.disableAutomock();

import configureStore from './util/configureStore';
import Plurality from '../constants/Plurality';

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
  store = configureStore(options).store;
}

function getConfig () {
  return store.getState().$$pepperoni.config;
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
    it('throws an invariant exception when name is not a string', () => {
      expect(() => {
        createStore({ customContentTypes: [111] });
      }).toThrowError(/Expecting custom content type name to be a string/);
    });

    builtInContentTypes.forEach(builtInType => {
      it(`throws an invariant exception when name is a built in type ${builtInType}`, () => {
        expect(() => {
          createStore({ customContentTypes: [builtInType] });
        }).toThrowError(/taken/);
      });
    });
  });

  describe('happy path', () => {
    it('adds contentType to list', () => {
      createStore({ customContentTypes: ['article'] });

      const config = getConfig();

      expect(config.contentTypes.article).toEqual(
        makeContentTypeObj('article', 'articles', 'articles')
      );
    });

    it('adds contentType to list with camelCased type', () => {
      createStore({ customContentTypes: ['blogPost'] });

      const config = getConfig();

      expect(config.contentTypes.blogPost).toEqual(
        makeContentTypeObj('blogPost', 'blogPosts', 'blog-posts')
      );
    });

    it('maintains more than one contentType on list', () => {
      createStore({
        customContentTypes: [
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
        customContentTypes: [{
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
        customContentTypes: [{
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
