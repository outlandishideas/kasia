jest.unmock('invariant');
jest.unmock('lodash.merge');
jest.unmock('urlencode');
jest.unmock('humps');

jest.unmock('../constants/WpApiEndpoints');
jest.unmock('../constants/ActionTypes');
jest.unmock('../constants/ContentTypes');
jest.unmock('../contentTypes');
jest.unmock('../fetchContent');

import 'isomorphic-fetch';

import ContentTypes from '../constants/ContentTypes';
import fetchContent from '../fetchContent';
import { makeBuiltInContentTypeOptions } from '../contentTypes';

global.fetch = jest.fn();

const contentTypeOptions = makeBuiltInContentTypeOptions();

const fetchCall = () => fetch.mock.calls[0][0];

const config = {
  wpApiUrl: 'http://test'
};

describe('fetchContent', () => {
  afterEach(() => global.fetch.mockClear());

  it('makes request for single content by numeric id', () => {
    fetchContent(contentTypeOptions[ContentTypes.POST], 1337, config);
    expect(fetchCall()).toEqual('http://test/posts/1337');
  });

  it('makes request for single content by slug', () => {
    fetchContent(contentTypeOptions[ContentTypes.POST], 'post-slug', config);
    expect(fetchCall()).toEqual('http://test/posts?slug=post-slug');
  });

  it('throws when requesting content type by slug that is not queryable by slug', () => {
    expect(() => {
      return fetchContent(contentTypeOptions[ContentTypes.COMMENT], 'comment-slug', config);
    }).toThrowError(/cannot query the content type/);
  });

  it('accepts query parameters, url encodes entities, and appends them to request endpoint', () => {
    const hasUrlEntities = 'me,myself&i';

    const options = { query: {
      page: 5,
      context: 'embed',
      search: hasUrlEntities
    }};

    fetchContent(contentTypeOptions[ContentTypes.POST], 1337, config, options);

    expect(fetchCall()).toEqual('http://test/posts/1337?page=5&context=embed&search=me%2Cmyself%26i');
  });

  it('builds endpoint for content type that requires multiple route parameters', () => {
    const options = { params: {
      postId: 13,
      id: 37
    }};

    fetchContent(contentTypeOptions[ContentTypes.POST_REVISION], 1337, config, options);

    expect(fetchCall()).toEqual('http://test/posts/13/revisions/37')
  });

  it('makes request for multiple subjects by constructing multiple filter[post__in] query parameters', () => {
    fetchContent(contentTypeOptions[ContentTypes.POST], [1, 2], config);
    expect(fetchCall()).toEqual('http://test/posts?filter[post__in][]=1&filter[post__in][]=2');
  });

  it('throws when multiple subject identifiers are not numeric', () => {
    expect(() => {
      return fetchContent(contentTypeOptions[ContentTypes.POST], [1, 'uh-oh'], config);
    }).toThrowError(/should be made using numeric/);
  });

  // TODO test post revisions route as has different route parameters requirement than the other routes
});
