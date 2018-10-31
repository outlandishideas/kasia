/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { connectWpQuery } from '../../../src/connect'
import { preload } from '../../../src/util/preload'

import bookJson from '../../__fixtures__/wp-api-responses/book'

const nested = connectWpQuery(() => {
  return Promise.resolve({...bookJson, id: bookJson.id + 1 })
}, () => true)(class {})

export const queryFn = function * () {
  yield preload([nested])()
  return yield Promise.resolve(bookJson)
}

export const target = class extends Component {
  render () {
    const { query, data: { books } } = this.props.kasia
    if (!query.complete || !query.OK) return <div>Loading...</div>
    return <div>{books[this.props.params.id].slug}</div>
  }
}

export default connectWpQuery(queryFn, () => true)(target)
