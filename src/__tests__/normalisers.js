jest.disableAutomock();

import postJson from './fixtures/wp-api-responses/post'
import normalisers from '../normalisers';

describe('POST normaliser', () => {
  const postId = String(postJson.id);
  const authorId = String(postJson.author);
  const mediaId = String(postJson.featured_media);
  const flattened = normalisers.POST(postJson);

  it('should pull nested content types', () => {
    expect(Object.keys(flattened.entities)).toEqual(['posts', 'users', 'media']);
    expect(typeof flattened.entities.posts[postId]).toEqual('object');
    expect(typeof flattened.entities.users[authorId]).toEqual('object');
    expect(typeof flattened.entities.media[mediaId]).toEqual('object');
  });
})
