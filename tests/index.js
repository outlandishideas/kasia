import React, { Component } from 'react';
import Repress from '../src';

@Repress.connect()
class Test extends Component {
  constructor (props, context) {
    super(props, context);
  }

  testMethod () {
    return "HI!"
  }
}

const a = new Test();
console.log(a.testMethod());
