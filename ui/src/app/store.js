import { configureStore } from '@reduxjs/toolkit';
import phraseReducer from '../features/phrase/phraseSlice';

export default configureStore({
  reducer: {
    phrase: phraseReducer
  },
});
