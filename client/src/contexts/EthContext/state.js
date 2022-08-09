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

const reducer = (state, data) => ({ ...state, ...data });

export { initialState, reducer };
