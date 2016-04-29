jest.disableAutomock();

jest.mock('invariant');

jest.mock('../src/reducer');

import invariant from 'invariant';

import pepperoni from '../src/pepperoni';
import makeReducer from '../src/reducer';
import Plurality from '../src/constants/Plurality';

describe('pepperoni', () => {
  beforeEach(() => {
    invariant.mockClear();
    makeReducer.mockClear();
  });

  it('exports a function', () => {
    expect(typeof pepperoni).toEqual('function');
  });

  it('throws an invariant violation when wpApiUrl is not a string', () => {
    pepperoni({ wpApiUrl: 11111 });

    expect(invariant).toBeCalledWith(
      false,
      'Expecting WP-API URL to be a string, got "%s".',
      'number'
    );
  });

  it('throws an invariant violation when wpApiUrl is undefined', () => {
    pepperoni({ wpApiUrl: undefined });

    expect(invariant).toBeCalledWith(
      false,
      'Expecting WP-API URL to be a string, got "%s".',
      'undefined'
    );
  });

  it('calls makeReducer with the correct object shape', () => {
    const input = {
      wpApiUrl: 'some-url.com',
      customContentTypes: [
        'FirstCustomPostType',
        'SecondCustomPostType'
      ]
    };

    const expected = {
      wpApiUrl: 'some-url.com',
      entityKeyPropName: 'ID',
      contentTypes: {
        FirstCustomPostType: {
          slug: {
            [Plurality.SINGULAR]: `/first-custom-post-types/:id`,
            [Plurality.PLURAL]: `/first-custom-post-types`
          },
          name: {
            canonical: 'FirstCustomPostType',
            [Plurality.SINGULAR]: 'firstCustomPostType',
            [Plurality.PLURAL]: 'firstCustomPostTypes'
          }
        },
        SecondCustomPostType: {
          slug: {
            [Plurality.SINGULAR]: `/second-custom-post-types/:id`,
            [Plurality.PLURAL]: `/second-custom-post-types`
          },
          name: {
            canonical: 'SecondCustomPostType',
            [Plurality.SINGULAR]: 'secondCustomPostType',
            [Plurality.PLURAL]: 'secondCustomPostTypes'
          }
        }
      }
    };

    pepperoni(input);

    expect(makeReducer).toBeCalledWith(expected);
  });
});
