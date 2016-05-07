export default {
  'description': '',
  'hierarchical': false,
  'name': 'Posts',
  'slug': 'post',
  '_links': {
    'collection': [{
      'href': 'http://demo.wp-api.org/wp-json/wp/v2/types'
    }],
    'wp:items': [{
      'href': 'http://demo.wp-api.org/wp-json/wp/v2/posts'
    }],
    'curies': [{
      'name': 'wp',
      'href': 'https://api.w.org/{rel}',
      'templated': true
    }]
  }
}
