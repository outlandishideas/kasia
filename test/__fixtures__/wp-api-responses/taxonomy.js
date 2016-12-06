export default {
  'name': 'Categories',
  'slug': 'category',
  'description': '',
  'types': ['post'],
  'hierarchical': true,
  '_links': {
    'collection': [{
      'href': 'http://demo.wp-api.org/wp-json/wp/v2/taxonomies'
    }],
    'wp:items': [{
      'href': 'http://demo.wp-api.org/wp-json/wp/v2/categories'
    }],
    'curies': [{
      'name': 'wp',
      'href': 'https://api.w.org/{rel}',
      'templated': true
    }]
  }
}
