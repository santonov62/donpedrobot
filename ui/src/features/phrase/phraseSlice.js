import { createSlice } from '@reduxjs/toolkit';

export const phraseSlice = createSlice({
  name: 'phrase',
  initialState: {
    value: []
  },
  reducers: {
    add: (state, action) => {
      const {text} = action.payload;
      state.value.push(text);
    }
  }
});

export const { add } = phraseSlice.actions;

export const addPhrase = ({text}) => dispatch => {
  dispatch(add({text}));
}

export const fetchPhrases = state => {
  return state.phrase.value
};

export default phraseSlice.reducer;