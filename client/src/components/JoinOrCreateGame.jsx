import { useState } from "react";
import Button from "./Button";
import useEth from "../contexts/EthContext/useEth";
import { POTATO_GAME_ENTRY_AMOUNT } from "../constants";
import web3 from "web3";
import BN from "bignumber.js";

function JoinOrCreateGame() {
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const { contracts, account } = useEth();

  const handleCreate = async () => {
    setCreating(true);

    const hotPotatoGameContractAddress =
      contracts.hotPotatoGame.contract._address;
    try {
      // Check if contract has enough potato allowance
      const allowance = await contracts.potato.contract.methods
        .allowance(account, hotPotatoGameContractAddress)
        .call();

      if (BN(allowance).lt(BN(POTATO_GAME_ENTRY_AMOUNT))) {
        console.log("atroden");
        await contracts.potato.contract.methods
          .approve(
            hotPotatoGameContractAddress,
            BN(POTATO_GAME_ENTRY_AMOUNT).minus(BN(allowance)) // Approve the difference
          )
          .send({ from: account });
      }

      const receipt = await contracts.hotPotatoGame.contract.methods
        .createGame()
        .send({ from: account });

      contracts.potato.contract.events.GameCreated(
        {
          filter: { owner: account },
        },
        console.log
      );

      console.log(receipt);
    } catch (ex) {
      console.log(ex.message);
      window.test = ex;
    } finally {
      setCreating(false);
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
        onClick={() => setJoining(true)}
        loading={joining}
        disabled={creating || joining}
      >
        Join game
      </Button>
    </div>
  );
}

export default JoinOrCreateGame;
