/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { connectWpQuery } from '../../../src/connect'
import bookJson from '../../__fixtures__/wp-api-responses/book'

export const queryFn = (wpapi, props) => {
  // return wpapi.books(props.params.id).get()
  return Promise.resolve(bookJson)
}

export const target = class extends Component {
  render () {
    const { query, data: { books } } = this.props.kasia
    if (!query.complete || !query.OK) return <div>Loading...</div>
    return <div>{books[this.props.params.id].slug}</div>
  }
}

export default connectWpQuery(queryFn, () => true)(target)
