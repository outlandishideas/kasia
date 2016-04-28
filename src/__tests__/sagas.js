jest.unmock('redux-saga');
jest.unmock('redux-saga/effects');
jest.unmock('lodash.merge');
jest.unmock('invariant');

jest.unmock('../constants/ActionTypes');
jest.unmock('../constants/ContentTypes');
jest.unmock('../actionCreators');
jest.unmock('../sagas');
jest.unmock('../fetchContent');
jest.unmock('../contentTypes');

import { put, call, select } from 'redux-saga/effects';

import ContentTypes from '../constants/ContentTypes';
import fetchContent from '../fetchContent';
import { makeBuiltInContentTypeOptions } from '../contentTypes';
import { configSelector, fetchResource } from '../sagas';
import { createRequest, startRequest } from '../actionCreators';

const contentTypes = makeBuiltInContentTypeOptions();
const contentType = ContentTypes.POST;
const createRequestOptions = { params: { id: 1337 }};
const mockConfig = { contentTypes };

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
      call(fetchContent, contentType, createRequestOptions, mockConfig, {})
    );
  });
});
