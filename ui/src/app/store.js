import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import phraseReducer from '../features/phrase/phraseSlice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    phrase: phraseReducer
  },
});
