import { useState } from "react";
import BN from "bignumber.js";

import { POTATO_GAME_ENTRY_AMOUNT } from "../constants";
import Button from "./Button";
import Chevron from "./icons/Chevron";
import JoinGameForm from "./JoinGameForm";
import clsx from "clsx";

function JoinOrCreateGame({
  address,
  hotPotatoGameContract,
  potatoContract,
  setGameId,
}) {
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [promptGameJoinId, setPromptGameJoinId] = useState(false);

  const handleCreate = async () => {
    setCreating(true);

    try {
      // Check if contract has enough potato allowance
      const allowance = await potatoContract.methods
        .allowance(address, hotPotatoGameContract._address)
        .call();

      if (BN(allowance).lt(BN(POTATO_GAME_ENTRY_AMOUNT))) {
        await potatoContract.methods
          .approve(hotPotatoGameContract._address, POTATO_GAME_ENTRY_AMOUNT)
          .send({ from: address });
      }

      const receipt = await hotPotatoGameContract.methods
        .createGame()
        .send({ from: address });

      setGameId(receipt.events.GameCreated.returnValues.gameId);
    } catch (ex) {
      console.log(ex.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (gameId) => {
    setJoining(true);

    try {
      // Check if contract has enough potato allowance
      const allowance = await potatoContract.methods
        .allowance(address, hotPotatoGameContract._address)
        .call();

      if (BN(allowance).lt(BN(POTATO_GAME_ENTRY_AMOUNT))) {
        await potatoContract.methods
          .approve(hotPotatoGameContract._address, POTATO_GAME_ENTRY_AMOUNT)
          .send({ from: address });
      }

      await hotPotatoGameContract.methods
        .joinGame(gameId)
        .send({ from: address });

      setGameId(gameId);
    } catch (ex) {
      console.log(ex.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[400px] m-auto">
      <Button
        onClick={handleCreate}
        loading={creating}
        disabled={creating || joining}
      >
        Create game
      </Button>

      <Button
        onClick={() => setPromptGameJoinId(!promptGameJoinId)}
        className="flex items-center justify-between"
      >
        <span className="w-5"></span>
        <span>Join game</span>
        <Chevron
          dir={promptGameJoinId ? "up" : "down"}
          className="text-white h-5 w-5"
        />
      </Button>

      <div className={clsx({ hidden: !promptGameJoinId })}>
        <JoinGameForm joinGame={handleJoin} contract={hotPotatoGameContract} />
      </div>
    </div>
  );
}

export default JoinOrCreateGame;
