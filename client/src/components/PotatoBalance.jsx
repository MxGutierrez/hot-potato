import Button from "./Button";
import { useState, useEffect, useCallback } from "react";
import useEth from "../contexts/EthContext/useEth";

function PotatoBalance() {
  const [claiming, setClaiming] = useState(false);

  const [potatoBalance, setPotatoBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const [decimals, setDecimals] = useState(null);
  const [loadingDecimals, setLoadingDecimals] = useState(false);
  const { account, contracts } = useEth();

  const fetchBalance = useCallback(async () => {
    try {
      setLoadingBalance(true);
      const balance = await contracts.potato.contract.methods
        .balanceOf(account)
        .call();

      setPotatoBalance(balance);
    } catch (ex) {
      console.log(ex);
    } finally {
      setLoadingBalance(false);
    }
  }, [account, contracts.potato.contract]);

  // Get user balance
  useEffect(() => {
    fetchBalance();
  }, [account, contracts.potato.contract, fetchBalance]);

  // Get ERC20 decimals
  useEffect(() => {
    const fetchDecimals = async () => {
      try {
        setLoadingDecimals(true);
        const decimals = await contracts.potato.contract.methods
          .decimals()
          .call();

        setDecimals(decimals);
      } catch (ex) {
        console.log(ex);
      } finally {
        setLoadingDecimals(false);
      }
    };

    fetchDecimals();
  }, [contracts.potato.contract]);

  // Listen for Transfer events
  useEffect(() => {
    contracts.potato.contract.events.Transfer(
      {
        filter: { from: account },
      },
      fetchBalance
    );
  }, [account, contracts.potato.contract, fetchBalance]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await contracts.potato.contract.methods.claim().send({ from: account });
    } catch (ex) {
      console.log(ex);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div>
      {decimals && potatoBalance !== null && (
        <p>{potatoBalance / 10 ** decimals}</p>
      )}
      <Button onClick={handleClaim} loading={claiming}>
        Claim
      </Button>
    </div>
  );
}

export default PotatoBalance;
