export default  {
	"post": {
		"description": "",
		"hierarchical": false,
		"name": "Posts",
		"slug": "post",
		"_links": {
			"collection": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/types"
			}],
			"wp:items": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/posts"
			}],
			"curies": [{
				"name": "wp",
				"href": "https:\/\/api.w.org\/{rel}",
				"templated": true
			}]
		}
	},
	"page": {
		"description": "",
		"hierarchical": true,
		"name": "Pages",
		"slug": "page",
		"_links": {
			"collection": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/types"
			}],
			"wp:items": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/pages"
			}],
			"curies": [{
				"name": "wp",
				"href": "https:\/\/api.w.org\/{rel}",
				"templated": true
			}]
		}
	},
	"attachment": {
		"description": "",
		"hierarchical": false,
		"name": "Media",
		"slug": "attachment",
		"_links": {
			"collection": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/types"
			}],
			"wp:items": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/media"
			}],
			"curies": [{
				"name": "wp",
				"href": "https:\/\/api.w.org\/{rel}",
				"templated": true
			}]
		}
	}
};
