import { useState } from "react";
import Button from "./Button";

function Login({ web3, setAccount }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!window?.ethereum?.isMetaMask) {
      return;
    }

    setLoading(true);
    try {
      const account = (await web3.eth.requestAccounts())[0];
      setAccount(account);
    } catch (ex) {
      console.log(ex);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} loading={loading}>
      <img src="/metamask.svg" alt="metamask" className="h-[35px] mr-[10px]" />
      Connect Wallet
    </Button>
  );
}

export default Login;
