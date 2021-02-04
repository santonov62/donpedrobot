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
      const phrase = action.payload;
      state.value = state.value.concat(phrase);
      state.isLoading = false;
    }
  }
});

const { add, loading } = phraseSlice.actions;

export const addPhrase = ({text}) => async dispatch => {
  dispatch(loading());
  const url = `${window.location.origin}/phrase`
  const phrase = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({text})
  }).then(res => res.json());
  dispatch(add(phrase));
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