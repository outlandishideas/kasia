jest.unmock('invariant');
jest.unmock('lodash.merge');
jest.unmock('urlencode');
jest.unmock('humps');

jest.unmock('../src/constants/WpApiEndpoints');
jest.unmock('../src/constants/ActionTypes');
jest.unmock('../src/constants/ContentTypes');
jest.unmock('../src/contentTypes');
jest.unmock('../src/fetchContent');

import 'isomorphic-fetch';

import ContentTypes from '../src/constants/ContentTypes';
import fetchContent from '../src/fetchContent';
import { builtInContentTypeOptions } from '../src/contentTypes';

global.fetch = jest.fn();
global.fetch.mockReturnValue(Promise.resolve());

const fetchCall = () => fetch.mock.calls[0][0];

const config = {
  host: 'http://test',
  wpApiUrl: '/wp'
};

describe('fetchContent', () => {
  afterEach(() => global.fetch.mockClear());

  it('makes request for single content by numeric id', () => {
    fetchContent(builtInContentTypeOptions[ContentTypes.POST], 1337, config);
    expect(fetchCall()).toEqual('http://test/wp/posts/1337?_embed');
  });

  it('makes request for single content by slug', () => {
    fetchContent(builtInContentTypeOptions[ContentTypes.POST], 'post-slug', config);
    expect(fetchCall()).toEqual('http://test/wp/posts?_embed&slug=post-slug');
  });

  it('throws when requesting content type by slug that is not queryable by slug', () => {
    expect(() => {
      return fetchContent(builtInContentTypeOptions[ContentTypes.COMMENT], 'comment-slug', config);
    }).toThrowError(/cannot query the content type/);
  });

  it('accepts query parameters, url encodes entities, and appends them to request endpoint', () => {
    const hasUrlEntities = 'me,myself&i';

    const options = { query: {
      page: 5,
      context: 'embed',
      search: hasUrlEntities
    }};

    fetchContent(builtInContentTypeOptions[ContentTypes.POST], 1337, config, options);

    expect(fetchCall()).toEqual('http://test/wp/posts/1337?_embed&page=5&context=embed&search=me%2Cmyself%26i');
  });

  it('builds endpoint for content type that requires multiple route parameters', () => {
    const options = { params: {
      postId: 13,
      id: 37
    }};

    fetchContent(builtInContentTypeOptions[ContentTypes.POST_REVISION], 1337, config, options);

    expect(fetchCall()).toEqual('http://test/wp/posts/13/revisions/37?_embed')
  });

  it('makes request for multiple subjects by constructing multiple filter[post__in] query parameters', () => {
    fetchContent(builtInContentTypeOptions[ContentTypes.POST], [1, 2], config);
    expect(fetchCall()).toEqual('http://test/wp/posts?_embed&filter[post__in][]=1&filter[post__in][]=2');
  });

  // TODO test post revisions route as has different route parameters requirement than the other routes
});
