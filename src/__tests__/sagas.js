jest.unmock('redux-saga');
jest.unmock('redux-saga/effects');

jest.unmock('../constants/ActionTypes');
jest.unmock('../constants/ContentTypes');
jest.unmock('../actionCreators');
jest.unmock('../sagas');
jest.unmock('../fetchContent');

import { put, call, select } from 'redux-saga/effects';

import ContentTypes from '../constants/ContentTypes';
import fetchContent from '../fetchContent';
import { configSelector, fetchResource } from '../sagas';

import {
  createRequest,
  startRequest
} from '../actionCreators';

const contentType = ContentTypes.POST;
const createRequestOptions = { params: { id: 1337 }};

describe('sagas', () => {
  const generator = fetchResource(
    createRequest(contentType, createRequestOptions)
  );

  it('yields a select using configuration selector', () => {
    expect(generator.next().value).toEqual(select(configSelector));
  });

  it('puts a create request action', () => {
    expect(generator.next().value).toEqual(put(startRequest(contentType)));
  });

  it('yields a call to fetchContent with ', () => {
    expect(generator.next().value).toEqual(
      call(fetchContent, contentType, createRequestOptions, undefined, {})
    );
  });
});
