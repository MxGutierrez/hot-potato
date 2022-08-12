import { useState } from "react";
import BN from "bignumber.js";

import { POTATO_GAME_ENTRY_AMOUNT } from "../constants";
import Button from "./Button";
import Chevron from "./icons/Chevron";
import JoinGameForm from "./JoinGameForm";
import CreateGameForm from "./CreateGameForm";

import clsx from "clsx";

function JoinOrCreateGame({
  address,
  hotPotatoGameContract,
  potatoContract,
  setGameId,
}) {
  const [creating, setCreating] = useState(false);
  const [promptGameCreate, setPromptGameCreate] = useState(false);
  const [joining, setJoining] = useState(false);
  const [promptGameJoinId, setPromptGameJoinId] = useState(false);

  const handleCreate = async (expirationDate) => {
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
        .createGame(expirationDate.getTime() / 1000)
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
    <div className="flex flex-col w-full m-auto items-center justify-center">
      <div className="max-w-[400px] w-full">
        <Button
          onClick={() => setPromptGameCreate(!promptGameCreate)}
          className="flex items-center justify-between w-full"
          type="outlined"
        >
          <span className="w-5"></span>
          <span>Create game</span>
          <Chevron
            dir={promptGameCreate ? "up" : "down"}
            className="text-primary h-5 w-5"
          />
        </Button>

        <div className={clsx({ hidden: !promptGameCreate })}>
          <CreateGameForm
            createGame={handleCreate}
            disabled={creating || joining}
          />
        </div>
      </div>

      <hr className="w-full my-8" />

      <div className="max-w-[400px] w-full">
        <Button
          onClick={() => setPromptGameJoinId(!promptGameJoinId)}
          className="flex items-center justify-between w-full"
          type="outlined"
        >
          <span className="w-5"></span>
          <span>Join game</span>
          <Chevron
            dir={promptGameJoinId ? "up" : "down"}
            className="text-primary h-5 w-5"
          />
        </Button>

        <div className={clsx({ hidden: !promptGameJoinId })}>
          <JoinGameForm
            address={address}
            joinGame={handleJoin}
            contract={hotPotatoGameContract}
            disabled={creating || joining}
          />
        </div>
      </div>
    </div>
  );
}

export default JoinOrCreateGame;
