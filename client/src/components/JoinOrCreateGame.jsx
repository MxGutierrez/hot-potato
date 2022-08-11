import { useState } from "react";
import BN from "bignumber.js";

import { POTATO_GAME_ENTRY_AMOUNT } from "../constants";
import Button from "./Button";

function JoinOrCreateGame({
  address,
  hotPotatoGameContract,
  potatoContract,
  setGameId,
}) {
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [promptGameId, setPromptGameId] = useState(false);
  const [localGameId, setLocalGameId] = useState("");

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

  const handleJoin = async () => {
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
        .joinGame(localGameId)
        .send({ from: address });

      setGameId(localGameId);
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

      <Button onClick={() => setPromptGameId(!promptGameId)}>Join game</Button>
      {promptGameId && (
        <div>
          <input
            value={localGameId}
            onChange={(e) => setLocalGameId(e.target.value)}
            className="border"
          />
          {localGameId && (
            <Button
              onClick={handleJoin}
              loading={joining}
              disabled={creating || joining}
            >
              Join!
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default JoinOrCreateGame;
