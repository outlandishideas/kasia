import ActionTypes from './ActionTypes';

export default function repressReducer (state = {}, action) {
  switch (action.type) {
    case ActionTypes.RECEIVE_POST:
      const nextState = Object.assign({}, state);

      if (!nextState.repress[action.postType]) {
        nextState.repress[action.postType] = {};
      }

      return Object.assign(nextState, {
        repress: {
          [action.postType]: {
            [action.id]: action.data
          }
        }
      });

    case ActionTypes.INVALIDATE_POST:
      delete state.repress[action.postType][action.id];
      return Object.assign({}, state);

    default:
      return state;
  }
}
