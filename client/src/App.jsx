import { useState } from "react";
import { useWeb3, useNetwork, useContracts } from "./hooks";

import Login from "./components/Login";
import Game from "./components/Game";
import JoinOrCreateGame from "./components/JoinOrCreateGame";
import PotatoBalance from "./components/PotatoBalance";
import Address from "./components/Address";

function App() {
  const [gameId, setGameId] = useState(null);
  const [address, setAddress] = useState("");

  const web3 = useWeb3();
  const networkId = useNetwork(web3);
  const contracts = useContracts(web3, networkId);

  return (
    <div className="min-h-screen flex">
      <div className="flex-1">
        {address ? (
          <div>
            {contracts.potato && (
              <PotatoBalance address={address} contract={contracts.potato} />
            )}
            <Address address={address} />
            <JoinOrCreateGame
              address={address}
              setGameId={setGameId}
              hotPotatoGameContract={contracts.hotPotatoGame}
              potatoContract={contracts.potato}
            />
            {gameId && (
              <Game
                id={gameId}
                address={address}
                hotPotatoGameContract={contracts.hotPotatoGame}
                hotPotatoContract={contracts.hotPotatoContract}
              />
            )}
          </div>
        ) : (
          <div className="h-full flex justify-center items-center">
            <Login web3={web3} setAddress={setAddress} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
