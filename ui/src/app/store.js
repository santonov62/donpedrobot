import { configureStore } from '@reduxjs/toolkit';
import phraseReducer from '../features/phrase/phraseSlice';
import disputeReducer from '../features/dispute/disputeSlice';

export default configureStore({
  reducer: {
    phrase: phraseReducer,
    dispute: disputeReducer
  },
});
