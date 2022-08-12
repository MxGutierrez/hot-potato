import { useState } from "react";
import BN from "bignumber.js";

import { POTATO_GAME_ENTRY_AMOUNT } from "../constants";
import JoinGameForm from "./JoinGameForm";
import CreateGameForm from "./CreateGameForm";
import parseJsonRpcError from "../utils/parseJsonRpcError";

import { Jigsaw, Ticket } from "./icons";

function JoinOrCreateGame({
  address,
  hotPotatoGameContract,
  potatoContract,
  setGameId,
}) {
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

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
        .call({ from: address });

      await hotPotatoGameContract.methods
        .joinGame(gameId)
        .send({ from: address });

      setGameId(gameId);
    } catch (ex) {
      console.log(parseJsonRpcError(ex));
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex flex-col w-full m-auto items-center justify-center">
      <div className="max-w-[400px] w-full">
        <h2 className="text-4xl text-primary flex items-center font-light">
          <Jigsaw className="h-8 w-8 mr-3" strokeWidth={1.5} />
          Create
        </h2>

        <CreateGameForm
          createGame={handleCreate}
          disabled={creating || joining}
        />
      </div>

      <hr className="w-full my-8" />

      <div className="max-w-[400px] w-full">
        <h2 className="text-4xl text-primary flex items-center font-light">
          <Ticket className="h-8 w-8 mr-3 " strokeWidth={1.5} filled={true} />
          Join
        </h2>

        <JoinGameForm
          address={address}
          joinGame={handleJoin}
          contract={hotPotatoGameContract}
          disabled={creating || joining}
        />
      </div>
    </div>
  );
}

export default JoinOrCreateGame;
