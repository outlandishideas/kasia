# Kasia Changelog

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
