/* global jest:false */

jest.disableAutomock()

import React, { Component } from 'react'

import { ContentTypes } from '../../src/contentTypes'
import { connectWpPost } from '../../src/connect'

@connectWpPost(ContentTypes.Post, (props) => props.params.id)
export default class BuiltInContentType extends Component {
  render () {
    const { query, post } = this.props.kasia

    if (!query.complete) {
      return <div>Loading...</div>
    }

    return <div>{post.title}</div>
  }
}
