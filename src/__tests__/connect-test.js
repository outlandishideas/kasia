jest.unmock('../connect');

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import repressConnect from '../connect';

@repressConnect
class Test extends Component {
  constructor (props, context) {
    super(props, context);
  }

  render () {
    return (
      <div id="blah">Hello world</div>
    );
  }
}

console.log(Test);

describe('get the thing running at all', () => {

  it('runs', () => {
    console.log(repressConnect);
    const instance = TestUtils.renderIntoDocument(
      <Test />
    );

    console.log(Test);
  });
});
