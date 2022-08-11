import { useState, useEffect } from "react";

import HotPotatoGame from "../contracts/HotPotatoGame.json";
import HotPotato from "../contracts/HotPotato.json";
import Potato from "../contracts/Potato.json";

function useContracts(web3, networkId) {
  const [contracts, setContracts] = useState({});

  useEffect(() => {
    if (!web3 || !networkId) {
      return;
    }

    const loadContracts = async () => {
      const hotPotatoGameContract = new web3.eth.Contract(
        HotPotatoGame.abi,
        HotPotatoGame.networks[networkId].address
      );

      const [hotPotatoContractAddress, potatoContractAddress] =
        await Promise.all([
          hotPotatoGameContract.methods._hotPotatoContract().call(),
          hotPotatoGameContract.methods._potatoContract().call(),
        ]);

      setContracts({
        hotPotatoGame: hotPotatoGameContract,
        hotPotato: new web3.eth.Contract(
          HotPotato.abi,
          hotPotatoContractAddress
        ),
        potato: new web3.eth.Contract(Potato.abi, potatoContractAddress),
      });
    };

    loadContracts();
  }, [web3, networkId]);

  return contracts;
}

export default useContracts;
