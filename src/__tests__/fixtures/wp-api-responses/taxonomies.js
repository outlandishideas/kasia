export default  {
	"category": {
		"name": "Categories",
		"slug": "category",
		"description": "",
		"types": ["post"],
		"hierarchical": true,
		"_links": {
			"collection": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/taxonomies"
			}],
			"wp:items": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/categories"
			}],
			"curies": [{
				"name": "wp",
				"href": "https:\/\/api.w.org\/{rel}",
				"templated": true
			}]
		}
	},
	"post_tag": {
		"name": "Tags",
		"slug": "post_tag",
		"description": "",
		"types": ["post"],
		"hierarchical": false,
		"_links": {
			"collection": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/taxonomies"
			}],
			"wp:items": [{
				"href": "http:\/\/demo.wp-api.org\/wp-json\/wp\/v2\/tags"
			}],
			"curies": [{
				"name": "wp",
				"href": "https:\/\/api.w.org\/{rel}",
				"templated": true
			}]
		}
	}
};
