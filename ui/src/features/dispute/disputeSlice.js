import { createSlice } from '@reduxjs/toolkit';

export const dipsuteSlice = createSlice({
  name: 'dispute',
  initialState: {
    value: [],
    isLoading: false
  },
  reducers: {
    loading: (state) => {
      state.isLoading = false;
    },
    loaded: (state, action) => {
      state.value = action.payload;
      state.isLoading = false;
    },
    done: (state, action) => {
      state.isLoading = false;
    },
    remove: (state, action) => {
      const {id} = action.payload;
      state.value = state.value.filter(dispute => dispute.id !== id);
    }
  }
});

const {loading, loaded, done, remove} = dipsuteSlice.actions;

export const fetchAwaitingResults = () => async dispatch => {
  dispatch(loading());
  const url = `${window.location.origin}/dispute/awaitingResults`
  const disputes = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json()) || [];
  dispatch(loaded(disputes));
}

export const removeDispute = ({id}) => async dispatch => {
  try {
    dispatch(loading());
    const url = `${window.location.origin}/dispute?id=${id}`
    await fetch(url, {
      method: 'DELETE'
    });
    dispatch(remove({id}));
  } finally {
    dispatch(done());
  }

}

export const allDisputes = state => {
  return state.dispute.value;
}

export default dipsuteSlice.reducer;