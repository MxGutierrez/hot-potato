const initialState = {
  id: null,
};

const reducer = (state, data) => {
  return { ...state, ...data };
};

export { initialState, reducer };
