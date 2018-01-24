# Kasia Changelog

- __v5.0.0__ - _???_

  - [BREAKING] Improved preloader API (`runSagas` has become `runPreloaders`, see docs)
  - [BREAKING] Actions (e.g. `createPostRequest`/`createQueryRequest`) signature changed to take single object as argument
  - Option to preserve return value of `connectWpQuery` query function ([#30](https://github.com/outlandishideas/kasia/issues/30))
  - Support comma-separated dot-paths for `shouldUpdate` ([#38](https://github.com/outlandishideas/kasia/issues/38))
  - Support generator query functions ([!59](https://github.com/outlandishideas/kasia/pull/59))
  - Support for per-component naive caching strategies (browser) ([#74](https://github.com/outlandishideas/kasia/issues/74))
  - Access to `req` and `res` objects in query functions (SSR) ([#77](https://github.com/outlandishideas/kasia/issues/77))
  - Added `prettier-standard` via `husky` & `lint-staged`

---

- __v4.0.0__

  - [BREAKING] WP API responses no longer modified by `wp-api-response-modify` by default. Functionality moved into [`kasia-plugin-wp-api-response-modify`](https://github.com/outlandishideas/kasia/tree/master/packages/kasia-plugin-wp-api-response-modify) plugin.
  - [BREAKING] Structure of `props.kasia` object changed: `entities` key is now `data`. This is to ready the library for [#30](https://github.com/outlandishideas/kasia/issues/30), where query result may not be a normalised collection of entities.
  - [BREAKING] `shouldUpdate` function is mandatory for `connectWpQuery` decorator. 
  - [BREAKING] `WP` config option is now `wpapi`.
  - [BREAKING] Preloaders renamed and fn signatures changes (see docs). `makePostPreloaderSaga` removed, use `preloadQuery` instead.
  - Provide stack trace for captured query errors. ([#37](https://github.com/outlandishideas/kasia/issues/37))
  - Plugins can intercept native reducers, e.g. `kasia-plugin-wp-api-response-modify`. ([#40](https://github.com/outlandishideas/kasia/issues/40))
  - `prepublish` scripts not run on `npm install`. ([#28](https://github.com/outlandishideas/kasia/issues/28))
  - Added `debug` config option, if true lib logs useful lifecycle information to the console.
  - Big refactor of library to make codebase more maintainable, manageable.
  
---

- __v3.2.0__ - _23/09/16_

    - Implemented safer internal query reconciliation logic such that prepared queries 
    target their components via their `displayName`.
    - Added `options` object parameter to connect decorators, where you can specify explicitly the `displayName`
    of the component if it is wrapped by other decorators.
    - Fix bug where preloader saga creator utilities in `kasia/util` disrupt prepared query reconciliation
    by incrementing prepared query count. (They do not have a corresponding component and so should not be
    considered "prepared" queries.) 
    - Fixed query errors not being added to query object (`error: "undefined"`). 
    - Log warning about erroneous queries.

- __v3.1.5__ - _22/09/16_

    - Replace use of redux's `connect` decorator with access to the store via `context`.
    - Quick fix for failed queries sneaking through to data reconciliation stage in decorators.
    TODO: implement more complete query error-handling solution.
    ([#29](https://github.com/outlandishideas/kasia/issues/29))

- __v3.1.2__ - _20/09/16_

    - Pass state as third argument to `connectWpQuery` query function.

- __v3.1.1__ - _19/09/16_

    - Fix bug where `wordpress` object removed from props during comparison to determine if 
    a request for new data should be made in `connectWpQuery`.

- __v3.1.0__ - _09/09/16_

    - Additional preloader saga creators for loading WP data into the store when server-side rendering: 
    `makeQueryPreloaderSaga` and `makePostPreloaderSaga`.

- __v3.0.0__ - _31/08/16_

    - [BREAKING] Fix bug in Universal Application solution that prevented components picking 
    up prepared query data on the client. Also involves change in API that means `ConnectComponent.makePreloader` returns array
    immediately instead of a function. ([#24](https://github.com/outlandishideas/kasia/issues/24))
    - Improved test coverage of universal application solution. ([#26](https://github.com/outlandishideas/kasia/issues/26))
    - Additional utility export `kasia/util`, currently only exporting `makePreloaderSaga()` for use with server-side rendering.
    - Improved developer feedback. ([#4](https://github.com/outlandishideas/kasia/issues/4), [#24](https://github.com/outlandishideas/kasia/issues/23))
    - Updates to README: better documentation of Universal Application solution. ([#25](https://github.com/outlandishideas/kasia/issues/25))
    - Update to latest version of Jest.
    
---

- __v2.4.0__ - _10/08/16_

    - Mixin `node-wpapi`'s available mixins to internal calls to `registerRoute` by default in order
    that filtering can be performed on custom content types, e.g. `news.filter(<options>).get()`.

- __v2.3.0__ - _10/08/16_

    - Fix functions passed as props to `connectWpQuery` causing infinite dispatching.
    ([#16](https://github.com/outlandishideas/kasia/issues/16))
    - Added second parameter `propsComparatorFn` to `connectWpQuery`.
    - Fix `connectWpPost` derived query chaining failing due to dependency on object property order.
    - Updates to README: added docs for new functionality, fix typos
    ([#19](https://github.com/outlandishideas/kasia/pull/19)).

- __v2.2.0__ - _08/08/16_

    - Added missing dependencies in `package.json`.
    - Removed unnecessary unmock of `lodash` in tests.
    - Fix query IDs being picked in reverse order when server-side rendering.
    - Added `.travis.yml`.

- __v2.1.0__ - _05/08/16_

    - Fix `connectWpQuery` fn not receiving props.

- __v2.0.0__ - _04/08/16_

    - [BREAKING] Updated sagas export to accommodate changes to redux-saga API introduced in [v0.10.0]().
    - Updates to README: fixed bad `node-wpapi` examples with endpoint missing `/wp-json`
    suffix, added quick Spongebob example as intro. :ok_hand:
    - Added `CHANGELOG.md`.

---

- __v1.0.2__ - _04/08/16_

    - Removed `postinstall` npm script because it runs before dependencies are installed(?!).

- __v1.0.1__ - _04/08/16_

    - Fix bad import statements (see next bullet).
    - Rename `ContentTypes.js` -> `contentTypes.js` as this was causing an error on
    Unix systems as import statements used the latter filename.

- __v1.0.0__ - _03/08/16_

    - Release! :tophat:
