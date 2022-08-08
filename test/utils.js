const timeTravelSeconds = async (time) => {
  await travelToTime(time);
  await mineBlock();

  return Promise.resolve(web3.eth.getBlock("latest"));
};

const travelToTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [time],
        id: new Date().getTime(),
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }
    );
  });
};

const mineBlock = () => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send(
      {
        jsonrpc: "2.0",
        method: "evm_mine",
        id: new Date().getTime(),
      },
      (err, _) => {
        if (err) {
          return reject(err);
        }
        const newBlockHash = web3.eth.getBlock("latest").hash;

        return resolve(newBlockHash);
      }
    );
  });
};

const claimAndApprove = async (
  owner,
  potatoContract,
  gameContract,
  amount = "100000000000000000000" // 100 potatoes (the claimable amount)
) => {
  await potatoContract.claim({ from: owner });
  await potatoContract.approve(gameContract.address, amount, {
    from: owner,
  });
};

module.exports = {
  timeTravelSeconds,
  claimAndApprove,
};
