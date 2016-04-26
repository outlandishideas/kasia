jest.disableAutomock();

import cloneDeep from 'lodash.cloneDeep';

import postJson from './fixtures/wp-api-responses/post'
import normalisers from '../normalisers';

describe('POST normaliser', () => {
  const postJson1 = postJson;
  const postJson2 = cloneDeep(postJson);
  const postJsons = [postJson1, postJson2];

  postJson2.id = 100;

  const postId = String(postJson1.id);
  const authorId = String(postJson1.author);
  const mediaId = String(postJson1.featured_media);

  function assertPostNormalised (flattened) {
  }

  it('should pull nested content types', () => {
    const flattened = normalisers.POST(postJson1);
    expect(flattened.result).toEqual(16);
    expect(Object.keys(flattened.entities)).toEqual(['posts', 'users', 'media']);
    expect(typeof flattened.entities.posts[postId]).toEqual('object');
    expect(typeof flattened.entities.users[authorId]).toEqual('object');
    expect(typeof flattened.entities.media[mediaId]).toEqual('object');
  });

  it('should normalise multiple posts', () => {
    const flattened = normalisers.POST(postJsons);
    expect(flattened.result).toEqual([16, 100]);
  });
})
