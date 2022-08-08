import { useState } from "react";
import web3 from "web3";

function Login({ address, setAddress }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      if (window?.ethereum?.isMetaMask) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setAddress(web3.utils.toChecksumAddress(accounts[0]));
      }
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <div className="h-full flex justify-center items-center">
      {address ? (
        <p>{address}</p>
      ) : (
        <button
          onClick={handleClick}
          className="bg-blue-600 px-[10px] py-[20px] rounded-lg flex items-center text-white text-lg"
        >
          <img
            src="/metamask.svg"
            alt="metamask"
            className="h-[35px] mr-[10px]"
          />
          Connect Wallet {loading}
        </button>
      )}
    </div>
  );
}

export default Login;
