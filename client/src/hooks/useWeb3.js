import { useState, useEffect } from "react";
import Web3 from "web3";

function useWeb3() {
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    setWeb3(new Web3(Web3.givenProvider || "ws://localhost:8545"));
  }, []);

  return web3;
}

export default useWeb3;
