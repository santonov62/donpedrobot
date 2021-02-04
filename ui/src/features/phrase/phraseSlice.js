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

export const fetchPhrases = () => async dispatch => {
  dispatch(loading());
  const url = `${window.location.origin}/phrase`
  const phrases = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json()) || [];
  dispatch(add(phrases));
}

export const selectPhrases = state => {
  return state.phrase.value
};

export const selectLoading = state => {
  return state.phrase.isLoading;
}

export default phraseSlice.reducer;