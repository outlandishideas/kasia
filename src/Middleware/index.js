import * as ActionTypes from './ActionTypes';

const keys = Object.keys(ActionTypes);

export default store => next => action => {
  if (!keys.includes(action.type)) {
    return next(action);
  }


};
