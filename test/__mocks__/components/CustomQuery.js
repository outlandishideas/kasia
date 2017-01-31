/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { connectWpQuery } from '../../../src/connect'

export const queryFn = (wpapi, props) => {
  return wpapi.books(props.params.id).get()
}

export const target = class extends Component {
  render () {
    const { query, data: { books } } = this.props.kasia
    if (!query.complete || !query.OK) return <div>Loading...</div>
    return <div>{books[this.props.params.id].slug}</div>
  }
}

export default connectWpQuery(queryFn, () => true)(target)
