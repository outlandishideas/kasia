/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import contentTypesManager from '../../../src/util/contentTypesManager'
import { connectWpPost } from '../../../src/connect'

contentTypesManager.register({
  name: 'book',
  plural: 'books',
  slug: 'books'
})

@connectWpPost('book', (props) => props.params.id)
export default class Book extends Component {
  render () {
    const { query, book } = this.props.kasia
    if (!query.complete) return <div>Loading...</div>
    return <div>{book.title.rendered}</div>
  }
}
