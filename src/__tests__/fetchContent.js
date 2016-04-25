/* global fetch:false */

jest.unmock('invariant');
jest.unmock('lodash.merge');
jest.unmock('urlencode');

jest.unmock('../constants/WpApiEndpoints');
jest.unmock('../constants/ContentTypes');
jest.unmock('../fetchContent');

import 'isomorphic-fetch';

import ContentTypes from '../constants/ContentTypes';
import fetchContent from '../fetchContent';

global.fetch = jest.fn();

const fetchCall = () => fetch.mock.calls[0][0];

const config = {
  wpApiUrl: 'http://test'
};

describe('fetchContent function', () => {
  afterEach(() => global.fetch.mockClear());

  it('makes request for single content by numeric id', () => {
    fetchContent(ContentTypes.POST, 1337, config);
    expect(fetchCall()).toEqual('http://test/posts/1337');
  });

  it('makes request for single content by slug', () => {
    fetchContent(ContentTypes.POST, 'post-slug', config);
    expect(fetchCall()).toEqual('http://test/posts?slug=post-slug');
  });

  it('throws when requesting content type by slug that is not queryable by slug', () => {
    expect(() => {
      return fetchContent(ContentTypes.COMMENT, 'comment-slug', config);
    }).toThrowError(/cannot query the content type/);
  });

  it('accepts query parameters, url encodes entities, and appends them to request endpoint', () => {
    const hasUrlEntities = 'me,myself&i';

    const options = { query: {
      page: 5,
      context: 'embed',
      search: hasUrlEntities
    }};

    fetchContent(ContentTypes.POST, 1337, config, options);

    expect(fetchCall()).toEqual('http://test/posts/1337?page=5&context=embed&search=me%2Cmyself%26i');
  });

  it('builds endpoint for content type that requires multiple route parameters', () => {
    fetchContent(ContentTypes.POST_REVISION, 1337, config, {
      params: {
        postId: 13,
        id: 37
      }
    });
    expect(fetchCall()).toEqual('http://test/posts/13/revisions/37')
  });
});
