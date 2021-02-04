import { createSlice } from '@reduxjs/toolkit';

export const phraseSlice = createSlice({
  name: 'phrase',
  initialState: {
    value: [],
    isLoading: false
  },
  reducers: {
    loading: (state) => {
      state.isLoading = true;
    },
    add: (state, action) => {
      state.value = state.value.concat(action.payload);
      state.isLoading = false;
    }
  }
});

const { add, loading } = phraseSlice.actions;

export const addPhrase = ({text}) => dispatch => {
  dispatch(loading());
  dispatch(add({text}));
}

export const fetchPhrases = (phrase) => dispatch => {
  dispatch(loading());
  dispatch(add({'text': 1111}));
}

export const selectPhrases = state => {
  return state.phrase.value
};

export const selectLoading = state => {
  return state.phrase.isLoading;
}

export default phraseSlice.reducer;