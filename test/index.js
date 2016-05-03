jest.disableAutomock();

jest.mock('invariant');

jest.mock('../src/reducer');

import merge from 'lodash.merge';
import invariant from 'invariant';

import Pepperoni from '../src/index';
import Plurality from '../src/constants/Plurality';
import makeReducer from '../src/reducer';
import { builtInContentTypeOptions } from '../src/contentTypes';

describe('Pepperoni', () => {
  beforeEach(() => {
    invariant.mockClear();
    makeReducer.mockClear();
  });

  it('exports a function', () => {
    expect(typeof Pepperoni).toEqual('function');
  });

  it('throws an invariant violation when `host` is not a string', () => {
    Pepperoni({ host: 11111 });

    expect(invariant).toBeCalledWith(
      false,
      'Expecting host to be a string, got "%s".',
      'number'
    );
  });

  it('throws an invariant violation when `host` is undefined', () => {
    Pepperoni({ host: undefined });

    expect(invariant).toBeCalledWith(
      false,
      'Expecting host to be a string, got "%s".',
      'undefined'
    );
  });

  it('calls makeReducer with the correct object shape', () => {
    const input = {
      host: 'some-url.com',
      contentTypes: [
        'FirstCustomPostType',
        'SecondCustomPostType'
      ]
    };

    const contentTypeOptions = {
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
    };

    const expected = {
      host: 'some-url.com',
      wpApiUrl: 'wp-json/wp/v2',
      entityKeyPropName: 'id',
      plugins: [],
      contentTypes: merge({}, builtInContentTypeOptions, contentTypeOptions)
    };

    Pepperoni(input);

    expect(makeReducer).toBeCalledWith(expected, []);
  });
});
