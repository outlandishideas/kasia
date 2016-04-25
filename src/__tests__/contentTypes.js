jest.unmock('../contentTypes');
jest.unmock('humps');
jest.unmock('../constants/ContentTypes');

import invariant from 'invariant';

import {
  registerCustomContentType,
  customContentTypes
} from '../contentTypes';

describe('registerCustomContentType', () => {
  beforeEach(() => {
    invariant.mockClear();

    // Required because customContentTypes is a constant and rightly so.
    Object.keys(customContentTypes).forEach(c => delete customContentTypes[c]);
    expect(Object.keys(customContentTypes).length).toEqual(0);
  });

  describe('unhappy path', () => {
    it('throws an invariant exception when name is not a string', () => {
      registerCustomContentType(111);

      expect(invariant).toBeCalledWith(
        false,
        'Expecting name of custom content type to be a string.'
      );
    });

    [
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
      'user',
      'customPostType'
    ].forEach(builtInType => {
      it(`throws an invariant exception when name is a built in type ${builtInType}`, () => {
        registerCustomContentType(builtInType);

        // TODO This is wrong! It should be one...
        expect(invariant.mock.calls.length).toEqual(2);
        expect(invariant).toBeCalledWith(
          true,
          'The content type "%s" is already taken. Choose another non-conflicting name.',
          builtInType
        );
      });
    });
  });

  describe('happy path', () => {
    it('adds contentType to list', () => {
      registerCustomContentType('article');

      const { article } = customContentTypes;

      expect(typeof article).toEqual('object');

      expect(article).toEqual({
        name: 'article',
        namePlural: 'articles',
        requestSlug: 'articles'
      });
    });

    it('adds contentType to list with camelCased type', () => {
      registerCustomContentType('blogPost');

      const { blogPost } = customContentTypes;

      expect(typeof blogPost).toEqual('object');

      expect(blogPost).toEqual({
        name: 'blogPost',
        namePlural: 'blogPosts',
        requestSlug: 'blogpost'
      });
    });

    it('maintains more than one contentType on list', () => {
      registerCustomContentType('article');

      const { article } = customContentTypes;

      expect(Object.keys(customContentTypes).length).toEqual(1);
      expect(typeof article).toEqual('object');

      expect(article).toEqual({
        name: 'article',
        namePlural: 'articles',
        requestSlug: 'articles'
      });

      registerCustomContentType('book');

      const { book } = customContentTypes;

      expect(Object.keys(customContentTypes).length).toEqual(2);
      expect(typeof book).toEqual('object');

      expect(book).toEqual({
        name: 'book',
        namePlural: 'books',
        requestSlug: 'books'
      });
    });

    it('adds contentType to list with custom pularisation', () => {
      registerCustomContentType('owl', {
        namePlural: 'parliament'
      });

      const { owl } = customContentTypes;

      expect(typeof owl).toEqual('object');

      expect(owl).toEqual({
        name: 'owl',
        namePlural: 'parliament',
        requestSlug: 'parliament'
      });
    });

    it('adds contentType to list with custom pularisation', () => {
      registerCustomContentType('owl', {
        namePlural: 'parliament'
      });

      const { owl } = customContentTypes;

      expect(typeof owl).toEqual('object');

      expect(owl).toEqual({
        name: 'owl',
        namePlural: 'parliament',
        requestSlug: 'parliament'
      });
    });

    it('adds contentType to list with custom endpoint', () => {
      registerCustomContentType('owl', {
        requestSlug: 'parliament'
      });

      const { owl } = customContentTypes;

      expect(typeof owl).toEqual('object');

      expect(owl).toEqual({
        name: 'owl',
        namePlural: 'owls',
        requestSlug: 'parliament'
      });
    });
  });
});
