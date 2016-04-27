jest.disableAutomock();

jest.mock('invariant');

jest.mock('../reducer');

import invariant from 'invariant';

import pepperoni from '../pepperoni';
import makeReducer from '../reducer';
import { RequestTypes } from '../constants/WpApiEndpoints';

describe('pepperoni', () => {
  beforeEach(() => {
    invariant.mockClear();
    makeReducer.mockClear();
  });

  it('exports a function', () => {
    expect(typeof pepperoni).toEqual('function');
  });

  it('throws an invariant violation when wpApiUrl is not a string', () => {
    pepperoni({
      wpApiUrl: 11111
    });

    expect(invariant).toBeCalledWith(
      false,
      'Expecting WP-API URL to be a string, got "%s".',
      'number'
    );
  });

  it('throws an invariant violation when wpApiUrl is undefined', () => {
    pepperoni({
      wpApiUrl: undefined
    });

    expect(invariant).toBeCalledWith(
      false,
      'Expecting WP-API URL to be a string, got "%s".',
      'undefined'
    );
  });

  it('calls makeReducer with the correct object shape', () => {
    const input = {
      wpApiUrl: 'some-url.com',
      useEmbedRequestQuery: false,
      customContentTypes: [
        'FirstCustomPostType',
        'SecondCustomPostType'
      ]
    };

    const expected = {
      wpApiUrl: 'some-url.com',
      useEmbedRequestQuery: false,
      contentTypes: [
        {
          slug: {
            [RequestTypes.SINGLE]: `/first-custom-post-types/:id`,
            [RequestTypes.PLURAL]: `/first-custom-post-types`
          },
          name: {
            canonical: 'FirstCustomPostType',
            [RequestTypes.SINGLE]: 'firstCustomPostType',
            [RequestTypes.PLURAL]: 'firstCustomPostTypes'
          }
        },
        {
          slug: {
            [RequestTypes.SINGLE]: `/second-custom-post-types/:id`,
            [RequestTypes.PLURAL]: `/second-custom-post-types`
          },
          name: {
            canonical: 'SecondCustomPostType',
            [RequestTypes.SINGLE]: 'secondCustomPostType',
            [RequestTypes.PLURAL]: 'secondCustomPostTypes'
          }
        }
      ]
    };

    pepperoni(input);

    console.log(makeReducer.mock.calls[0])

    expect(makeReducer).toBeCalledWith(expected);
  });
});
