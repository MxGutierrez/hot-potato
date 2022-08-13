import { useState } from "react";
import { useWeb3, useNetwork, useContracts } from "./hooks";

import Login from "./components/Login";
import Game from "./components/Game";
import JoinOrCreateGame from "./components/JoinOrCreateGame";
import PotatoBalance from "./components/PotatoBalance";
import Header from "./components/Header";
import Table from "./components/Table";

function App() {
  const [gameId, setGameId] = useState(null);
  const [address, setAddress] = useState("");

  const web3 = useWeb3();
  const networkId = useNetwork(web3);
  const contracts = useContracts(web3, networkId);

  return (
    <>
      <Header address={address} />
      <div className="flex-1 flex flex-col pt-6 pb-12 bg-[#f9fafb]">
        <div className="container flex-1 flex flex-col">
          {address ? (
            <>
              {contracts.potato && (
                <PotatoBalance address={address} contract={contracts.potato} />
              )}
              <Table
                players={[
                  "0x430B1Eb67658F3C8acDdD7c0055bc2549F729526",
                  "0x330B1Eb67658F3C8acDdD7c0055bc2549F729521",
                  "0x7650ED4022eC5EFfbA8E232706991eb05c418D8E",
                ]}
              />
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
            </>
          ) : (
            <div className="flex-1 flex justify-center items-center">
              <Login web3={web3} setAddress={setAddress} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
