import Button from "./Button";
import { useState, useEffect, useCallback } from "react";

function PotatoBalance({ address, contract }) {
  const [claiming, setClaiming] = useState(false);

  const [potatoBalance, setPotatoBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const [decimals, setDecimals] = useState(null);
  const [loadingDecimals, setLoadingDecimals] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      setLoadingBalance(true);
      const balance = await contract.methods.balanceOf(address).call();

      setPotatoBalance(balance);
    } catch (ex) {
      console.log(ex);
    } finally {
      setLoadingBalance(false);
    }
  }, [address, contract]);

  // Get user balance
  useEffect(() => {
    fetchBalance();
  }, [address, contract, fetchBalance]);

  // Get ERC20 decimals
  useEffect(() => {
    const fetchDecimals = async () => {
      try {
        setLoadingDecimals(true);
        const decimals = await contract.methods.decimals().call();

        setDecimals(decimals);
      } catch (ex) {
        console.log(ex);
      } finally {
        setLoadingDecimals(false);
      }
    };

    fetchDecimals();
  }, [contract]);

  // Listen for Transfer events
  useEffect(() => {
    const subscriptions = [
      contract.events.Transfer(
        {
          filter: { from: address },
        },
        fetchBalance
      ),
      contract.events.Transfer(
        {
          filter: { to: address },
        },
        fetchBalance
      ),
    ];

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [address, contract, fetchBalance]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await contract.methods.claim().send({ from: address });
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
