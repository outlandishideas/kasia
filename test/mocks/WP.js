/* global jest:false */

import { setWP } from '../../src/wpapi'

setWP({
  registerRoute: jest.fn()
})
