export default {
  'id': 16,
  'post': 43,
  'parent': 0,
  'author': 0,
  'author_name': 'Dereck Friesen',
  'author_url': 'https://www.Kris.com/alias-explicabo-recusandae-architecto-aliqua',
  'date': '2015-05-27T02:12:29',
  'date_gmt': '2015-05-27T02:12:29',
  'content': {
    'rendered': '<p>Molestiae aliquam eligendi facere officiis quae impedit eos. Sapiente quas non eum aut. Alias quam similique odio in cupiditate. Ut aut aut delectus officia iusto error maxime neque.</p>\n<p>Consequatur eius ut aut vero culpa. Beatae delectus qui culpa occaecati maiores. Tempora voluptas quo inventore temporibus consectetur vitae. Voluptatem sit expedita et harum dolores. Dolorum magni sequi officiis temporibus.</p>\n<p>Perferendis dolor sit rem. Omnis repudiandae quia minima animi sequi. Aspernatur recusandae quod ea tempora.</p>\n'
  },
  'link': 'http://demo.wp-api.org/2015/05/17/voluptates-quis-ut-qui/#comment-16',
  'status': 'approved',
  'type': 'comment',
  'author_avatar_urls': {
    '24': 'http://0.gravatar.com/avatar/fe6e007015afc17a401d8ea853a3e05c?s=24&d=mm&r=g',
    '48': 'http://0.gravatar.com/avatar/fe6e007015afc17a401d8ea853a3e05c?s=48&d=mm&r=g',
    '96': 'http://0.gravatar.com/avatar/fe6e007015afc17a401d8ea853a3e05c?s=96&d=mm&r=g'
  },
  '_links': {
    'self': [{
      'href': 'http://demo.wp-api.org/wp-json/wp/v2/comments/16'
    }],
    'collection': [{
      'href': 'http://demo.wp-api.org/wp-json/wp/v2/comments'
    }],
    'up': [{
      'embeddable': true,
      'post_type': 'post',
      'href': 'http://demo.wp-api.org/wp-json/wp/v2/posts/43'
    }]
  },
  '_embedded': {
    'up': [{
      'id': 43,
      'date': '2015-05-17T12:30:17',
      'slug': 'voluptates-quis-ut-qui',
      'type': 'post',
      'link': 'http://demo.wp-api.org/2015/05/17/voluptates-quis-ut-qui/',
      'title': {
        'rendered': 'Voluptates quis ut qui'
      },
      'excerpt': {
        'rendered': '<p>Omnis quia quam aliquid fugit. Saepe voluptas excepturi ratione corrupti cum. Animi asperiores qui nulla ut mollitia. Et neque eos aut magni et id vel Modi consequatur et qui perferendis. Dolor adipisci quo. Sequi autem illo deserunt excepturi enim ut. Vel dolores aperiam et ullam facilis. Maiores illo quis dolorem iure fugit non Magnam et [&hellip;]</p>\n'
      },
      'author': 44,
      '_links': {
        'self': [{
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/posts/43'
        }],
        'collection': [{
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/posts'
        }],
        'about': [{
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/types/post'
        }],
        'author': [{
          'embeddable': true,
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/users/44'
        }],
        'replies': [{
          'embeddable': true,
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/comments?post=43'
        }],
        'version-history': [{
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/posts/43/revisions'
        }],
        'wp:featuredmedia': [{
          'embeddable': true,
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/media/42'
        }],
        'wp:attachment': [{
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/media?parent=43'
        }],
        'wp:term': [{
          'taxonomy': 'category',
          'embeddable': true,
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/categories?post=43'
        },
        {
          'taxonomy': 'post_tag',
          'embeddable': true,
          'href': 'http://demo.wp-api.org/wp-json/wp/v2/tags?post=43'
        }],
        'curies': [{
          'name': 'wp',
          'href': 'https://api.w.org/{rel}',
          'templated': true
        }]
      }
    }]
  }
}
