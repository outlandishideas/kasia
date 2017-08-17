## Draft Posts

It is possible for Kasia to query for draft posts (and revisions) and for the WordPress CMS "Preview" button to link
through to the relevant page in your Node application, but there is some set-up necessary on the WordPress side to
get it all working.

### 1. [WordPress] Install the `Basic-Auth` plugin

You can find the [plugin and installation instructions here](https://github.com/WP-API/Basic-Auth). 

### 2. [WordPress] The `preview_post_link` hook

In your WordPress theme's `functions.php` file you will need to define the `preview_post_link` hook and a function
that it points to which will tell WordPress where to take the user when they click the "Preview" button.

  For example:

  ```php
class CustomTheme
{
  public function __construct () {
    add_filter('preview_post_link', [$this, 'getPreviewLink'], 10, 2);
  }

  function getPreviewLink ($link, $post) {
    return home_url('/' . $post->ID . '?preview=1');
  }
}
```

### 3. [Application] Configure your server router

In order to fetch draft/preview posts we need a user's credentials.

Assuming that when the user wants to view a draft post they will arrive to your page with the
  query parameter `preview=1` (as in the example in part 2), we can then request their WordPress creds
by sending back a `401` response with a `WWW-Authenticate` header.

  Once the user has entered their creds and re-sent the request we store them on the `global` object so that
when the application performs the server-side render the Kasia decorator responsible for fetching the draft
post has access to the credentials too.

  Here is an example Express middleware:

  ```js
// Get or set WordPress credentials for request for page previews.
// Note that this will only work with server-side rendering.
app.use((req, res, next) => {
  if ('preview' in req.query) {
    const authCreds = req.get('Authorization')
    
    console.log(`requested preview [${req.originalUrl}] ${authCreds ? 'with' : 'without'} credentials`)

    if (!authCreds) {
      console.log('Prompting for credentials')
      return res
        .status(401)
        .set('WWW-Authenticate', 'Basic realm="Wordpress"')
        .send('Unauthorised')
    }

    const str = authCreds.split(' ')
    const decoded = new Buffer(str[1], 'base64').toString()
    const [ username, password ] = decoded.split(':')

    global._WordPress_Authorisation_Creds_ = { username, password }
  }

  next()
})
```

### 4. [Application] Tell Kasia to query for draft/preview posts

Finally, in order to instruct Kasia to get a draft/preview post we need to use the `connectWpQuery` decorator.

For example, if the post type was 'news', your query might look something like this:

```js
@connectWpQuery((wpapi, props, state) => {
  const isPreview = 'preview' in props.location.query
  let { slug } = props.params
  
  if (isPreview) {
    slug = parseInt(slug)
  }

  const cacheSearch = isPreview ? { id: slug } : { slug }
  const cached = _.filter(state.wordpress.entities.news, cacheSearch)

  if (cached && cached.length) {
    return cached
  } else if (isPreview && !global.authorisation) {
    return []
  }

  let query = wpapi.news()
  
  if (isPreview) {
    query = query
      .param('status', 'draft')
      .id(slug)
      // PASS IN USER WP CREDS WE COLLECTED IN ROUTER
      .auth(global._WordPress_Authorisation_Creds_) 
  } else {
    query = query.slug(slug)
  }

  return query.embed()
})
```
