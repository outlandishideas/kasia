jest.unmock('../index');

import invariant from 'invariant';

import configureRepress from '../index';
import { registerCustomContentType } from '../contentTypes';
import makeReducer from '../reducer';

describe('configureRepress', () => {

  it('exports a function', () => {
    expect(typeof configureRepress).toEqual('function');
  });

  it('throws an invariant violation when wpApiUrl is not a string', () => {
    configureRepress({
      wpApiUrl: 11111
    });

    expect(invariant).toBeCalledWith(
      false,
      'Expecting WP-API URL to be a string, got "%s".',
      'number'
    );
  });

  it('registers each customContentTypes provided', () => {
    configureRepress({
      wpApiUrl: 'some-url.com',
      customContentTypes: [
        'first-custom-post-type',
        'second-custom-post-type'
      ]
    });

    expect(registerCustomContentType.mock.calls.length).toEqual(2);
    expect(registerCustomContentType.mock.calls[0][0]).toEqual('first-custom-post-type');
    expect(registerCustomContentType.mock.calls[1][0]).toEqual('second-custom-post-type');
  });

  it('calls makeReducer with the correct object shape', () => {
    const expected = {
      wpApiUrl: 'some-url.com',
      useEmbedRequestQuery: false
    };

    const completeConfig = Object.assign({}, expected, {
      customContentTypes: [
        'first-custom-post-type',
        'second-custom-post-type'
      ]
    });

    configureRepress(completeConfig);

    expect(makeReducer).toBeCalledWith(expected);
  });
});
