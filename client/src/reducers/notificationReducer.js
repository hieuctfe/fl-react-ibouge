import {
  NOTIFICATION_SUCCESS,
  LOAD_NOTIFICATION,
  SET_GROUP_CHAT_MODAL_STATUS,
  NEW_NOTIFICATION,
  READ_NEW_NOTIFICATION,
} from '../actions/action_types/notification';
/**
 * export const RESTORE_EMAIL_LOADING = 'RESTORE_EMAIL_LOADING';
export const RESTORE_EMAIL_SUCCESS = 'RESTORE_EMAIL_SUCCESS';
export const RESTORE_EMAIL_FAILED = 'RESTORE_EMAIL_FAILED';
 */
const initialState = {
  isOpen: false,
  hasNewMessage: false,
  data: [],
  groupChatModalIsOpen: {
    isOpen: false,
    roomNumber: '',
  },
};

const notificationReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case NEW_NOTIFICATION:
      return {
        ...state,
        hasNewMessage: true,
      };
    case READ_NEW_NOTIFICATION:
      return {
        ...state,
        hasNewMessage: false,
      };
    case NOTIFICATION_SUCCESS:
      return {
        ...state,
        isOpen: false,
        data: [...state.data, payload],
      };
    case LOAD_NOTIFICATION:
      console.log('ssdfsdfsdfsdfsdfsdfsdfsdfds')
      return {
        ...state,
        isOpen: false,
        data: payload,
      };
    case SET_GROUP_CHAT_MODAL_STATUS:
      return {
        ...state,
        groupChatModalIsOpen: payload,
      };
    default:
      return state;
  }
};
export default notificationReducer;
