/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { connectWpQuery } from '../../../src/connect'

@connectWpQuery((wpapi, props) => wpapi.books(props.params.id).get(), () => true)
export default class Books extends Component {
  render () {
    const {
      query,
      entities: { books }
    } = this.props.kasia

    if (!query.complete) {
      return <div>Loading...</div>
    }

    return <div>{books[this.props.params.id].slug}</div>
  }
}
