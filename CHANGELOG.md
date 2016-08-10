# Kasia Changelog

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
