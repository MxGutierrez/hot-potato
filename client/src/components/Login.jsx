import { useState, useEffect } from "react";
import Button from "./Button";

function Login({ web3, setAddress }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      console.log("accountsChanged");
    };

    window.ethereum.on("accountsChanged", handleChange);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleChange);
    };
  }, []);

  const handleClick = async () => {
    if (!window?.ethereum?.isMetaMask) {
      // TODO: Handle this with some error alert or smth
      return;
    }

    setLoading(true);
    try {
      const address = (await web3.eth.requestAccounts())[0];
      setAddress(address);
    } catch (ex) {
      console.log(ex);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} loading={loading}>
      <img src="/metamask.svg" alt="metamask" className="h-[25px] mr-[10px]" />
      Login with MetaMask
    </Button>
  );
}

export default Login;
