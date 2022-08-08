const actions = {
  init: "INIT",
};

const initialState = {
  loading: true,
  web3: null,
  account: null,
  networkID: null,
  contracts: {
    hotPotatoGame: null,
    hotPotato: null,
    potato: null,
  },
};

const reducer = (state, action) => {
  const { type, data } = action;
  console.log("setting", action);
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export { actions, initialState, reducer };
