/* global jest:false */

// jest.disableAutomock() hoisted here by babel-jest

import React, { Component } from 'react'

import connectWpQuery from '../../../src/connect/connectWpQuery'

jest.disableAutomock()

export const queryFn = (wpapi, props) => {
  return wpapi.books(props.params.id).get()
}

export class target extends Component {
  render () {
    const { query, data: { books } } = this.props.kasia
    if (!query.complete || !query.OK) return <div>Loading...</div>
    return <div>{books[this.props.params.id].slug}</div>
  }
}

export default connectWpQuery(queryFn, () => true)(target)
