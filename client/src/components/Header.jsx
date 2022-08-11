import { useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";

import Logo from "./Logo";
import Address from "./Address";
import ClipboardLogo from "./icons/Clipboard";

function Header({ address }) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className="px-4 border-b border-gray-200 shadow-sm py-1">
      <div className="container flex items-center justify-between">
        <Logo />

        <div className="relative flex items-center space-x-2 cursor-pointer">
          {address && (
            <button
              onClick={copyAddress}
              className="flex items-center space-x-3 group"
            >
              <div className="relative h-[50px] w-[50px]">
                <Jazzicon diameter={50} seed={jsNumberForAddress(address)} />
                <div className="hidden absolute left-0 top-0 z-20 bg-white bg-opacity-75 group-hover:flex justify-center items-center h-full w-full transition-all">
                  {copied ? (
                    <p className="text-[0.7rem] text-primary">Copied</p>
                  ) : (
                    <ClipboardLogo className="h-6 w-6 text-primary" />
                  )}
                </div>
              </div>
              <div className="hidden sm:block">
                <Address address={address} />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
