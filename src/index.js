import ContentTypes from './constants/ContentTypes';
import connect from './connect';
import reducer from './reducer';
import { registerCustomContentType } from './customContentTypes';

export default {
  ContentTypes,
  connect,
  reducer,
  registerCustomContentType
};
