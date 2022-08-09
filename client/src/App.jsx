import { useReducer, useCallback, useEffect } from "react";
import Login from "./components/Login";
import Table from "./components/Game";
import JoinOrCreateGame from "./components/JoinOrCreateGame";
import PotatoBalance from "./components/PotatoBalance";
import Address from "./components/Address";
import Web3 from "web3";
import EthContext from "./contexts/EthContext/EthContext";
import { reducer, initialState } from "./contexts/EthContext/state";

import HotPotatoGame from "./contracts/HotPotatoGame.json";
import HotPotato from "./contracts/HotPotato.json";
import Potato from "./contracts/Potato.json";
import GameProvider from "./contexts/game/provider";

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(async () => {
    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    const networkID = await web3.eth.net.getId();
    console.info("Network id: ", networkID);

    const contract = new web3.eth.Contract(
      HotPotatoGame.abi,
      HotPotatoGame.networks[networkID].address
    );
    const contracts = {
      hotPotatoGame: {
        artifact: HotPotatoGame,
        contract,
      },
      hotPotato: {
        artifact: HotPotato,
        contract: new web3.eth.Contract(
          HotPotato.abi,
          await contract.methods._hotPotatoContract().call()
        ),
      },
      potato: {
        artifact: Potato,
        contract: new web3.eth.Contract(
          Potato.abi,
          await contract.methods._potatoContract().call()
        ),
      },
    };

    dispatch({
      web3,
      networkID,
      contracts,
      loading: false,
    });
  }, []);

  useEffect(() => {
    const tryInit = async () => {
      try {
        init();
      } catch (err) {
        console.error(err);
      }
    };

    tryInit();
  }, [init]);

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init();
    };

    events.forEach((e) => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach((e) => window.ethereum.removeListener(e, handleChange));
    };
  }, [init]);

  return (
    <EthContext.Provider
      value={{
        ...state,
        dispatch,
      }}
    >
      <GameProvider>
        <div className="min-h-screen flex">
          <div className="flex-1">
            {state.web3 && state.account ? (
              <div>
                <PotatoBalance />
                <Address address={state.account} />
                <JoinOrCreateGame />
                <Table />
              </div>
            ) : (
              <div className="h-full flex justify-center items-center">
                <Login
                  web3={state.web3}
                  setAccount={(account) => dispatch({ account })}
                />
              </div>
            )}
          </div>
        </div>
      </GameProvider>
    </EthContext.Provider>
  );
}

export default App;
