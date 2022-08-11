import { useState, useEffect, useCallback } from "react";
import PlusCircle from "./icons/PlusCircle";
import { POTATO_CLAIM_INTERVAL_DAYS } from "../constants";

function PotatoBalance({ address, contract }) {
  const [claiming, setClaiming] = useState(false);
  const [canClaim, setCanClaim] = useState(false);

  const [potatoBalance, setPotatoBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const [decimals, setDecimals] = useState(null);
  const [loadingDecimals, setLoadingDecimals] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      setLoadingBalance(true);
      const [balance, lastClaimTimestamp] = await Promise.all([
        contract.methods.balanceOf(address).call(),
        contract.methods._lastClaims(address).call(),
      ]);

      setCanClaim(
        new Date() >
          new Date(
            (parseInt(lastClaimTimestamp) +
              60 * 60 * 24 * POTATO_CLAIM_INTERVAL_DAYS) *
              1000
          )
      );

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
    <div className="w-full flex justify-end">
      <div className="flex items-center">
        <div className="flex items-center space-x-2.5 border border-gray-200 shadow-sm bg-white rounded-full py-2 px-4">
          <img src="/potato.svg" className="w-8 h-8" />
          {decimals && potatoBalance !== null && (
            <p className="text-lg">
              {(potatoBalance / 10 ** decimals).toFixed(2)}
            </p>
          )}
          {canClaim && (
            <button onClick={handleClaim}>
              <PlusCircle className="h-5 w-5 text-primary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PotatoBalance;
