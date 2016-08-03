/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { connectWpPost } from '../../src/connect'

@connectWpPost('book', (props) => props.params.id)
export default class Book extends Component {
  render () {
    const { query, book } = this.props.kasia

    if (!query.complete) {
      return <div>Loading...</div>
    }

    return <div>{book.title}</div>
  }
}
