const hotPotatoGame = artifacts.require("./HotPotatoGame.sol");
const potato = artifacts.require("./Potato.sol");
const { timeTravelSeconds } = require("./utils");

contract("Potato", async (accounts) => {
  let contract;
  const [alice, bob] = accounts;

  beforeEach("Setup contract", async () => {
    // Get Potato contract through HotPotatoGame contract
    const hotPotatoGameContract = await hotPotatoGame.new();
    contract = await potato.at(await hotPotatoGameContract._potatoContract());
  });

  it("Should allow daily claim", async () => {
    const oldBalance = (await contract.balanceOf(alice)).toString();
    assert.equal("0", oldBalance, "Alice should have 0 potatoes");

    await contract.claim({ from: alice });

    const newBalance = (await contract.balanceOf(alice)).toString();
    assert.equal(
      newBalance,
      "100000000000000000000", // 100 potatoes
      `Alice should have 100000000000000000000 potatoes`
    );
  });

  it("Should only allow user to claim once a day", async () => {
    await contract.claim({ from: alice });

    // Transfer 1 quintillionth of potato to bob so that alice can reclaim
    await contract.transfer(bob, "1", { from: alice });
    try {
      await contract.claim({ from: alice });
      assert(false, "Shouldn't have allowed to claim again");
    } catch (ex) {
      console.log(ex.message);
      assert(
        ex.message.includes("Can only claim once a day"),
        "Should return can only claim once a day error 1"
      );
    }

    await timeTravelSeconds(60 * 60 * 20); // Travel 20hs forward

    await contract.transfer(bob, "1", { from: alice });

    try {
      await contract.claim({ from: alice });
      assert(false, "Shouldn't have allowed to claim after 20hs");
    } catch (ex) {
      assert(
        ex.message.includes("Can only claim once a day"),
        "Should return can only claim once a day error 2"
      );
    }

    await timeTravelSeconds(60 * 60 * 25); // Travel 25hs forward

    await contract.transfer(bob, "1", { from: alice });

    await contract.claim({ from: alice });
  });
});
