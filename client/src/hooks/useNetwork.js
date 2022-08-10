import { useState, useEffect } from "react";

function useNetwork(web3) {
  const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    if (!web3) {
      return;
    }

    const getNetworkId = async () => {
      setNetworkId(await web3.eth.net.getId());
    };

    getNetworkId();
  }, [web3]);

  return networkId;
}

export default useNetwork;
