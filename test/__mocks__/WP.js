/* global jest:false */

import { setWP } from '../../src/wpapi'

export const wpapi = {
  registerRoute: jest.fn()
}

export default setWP(wpapi)
