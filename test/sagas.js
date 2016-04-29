jest.unmock('redux-saga');
jest.unmock('redux-saga/effects');
jest.unmock('lodash.merge');
jest.unmock('invariant');

jest.unmock('../src/constants/ActionTypes');
jest.unmock('../src/constants/ContentTypes');
jest.unmock('../src/actionCreators');
jest.unmock('../src/sagas');
jest.unmock('../src/fetchContent');
jest.unmock('../src/contentTypes');

import { put, call, select } from 'redux-saga/effects';

import ContentTypes from '../src/constants/ContentTypes';
import fetchContent from '../src/fetchContent';
import { makeBuiltInContentTypeOptions } from '../src/contentTypes';
import { configSelector, fetchResource } from '../src/sagas';
import { createRequest, startRequest } from '../src/actionCreators';

const contentTypeOptions = makeBuiltInContentTypeOptions();
const contentType = ContentTypes.POST;
const createRequestOptions = { params: { id: 1337 }};

const mockConfig = {
  contentTypes: contentTypeOptions
};

describe('sagas', () => {
  const generator = fetchResource(
    createRequest(contentType, createRequestOptions)
  );

  it('yields a select using configuration selector', () => {
    expect(generator.next().value).toEqual(select(configSelector));
  });

  it('puts a create request action', () => {
    expect(generator.next(mockConfig).value).toEqual(put(startRequest(contentType)));
  });

  it('yields a call to fetchContent with original arguments', () => {
    expect(generator.next().value).toEqual(
      call(fetchContent, contentTypeOptions[ContentTypes.POST], createRequestOptions, mockConfig, {})
    );
  });
});