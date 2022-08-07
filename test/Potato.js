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

    try {
      await contract.claim({ from: alice });
      assert(false, "Shouldn't have allowed to claim again");
    } catch (ex) {
      assert(
        ex.message.includes("Can only claim once a day"),
        "Should return can only claim once a day error"
      );
    }

    await timeTravelSeconds(60 * 60 * 20); // Travel 20hs forward

    try {
      await contract.claim({ from: alice });
      assert(false, "Shouldn't have allowed to claim after 20hs");
    } catch (ex) {
      assert(
        ex.message.includes("Can only claim once a day"),
        "Should return can only claim once a day error"
      );
    }

    await timeTravelSeconds(60 * 60 * 25); // Travel 25hs forward

    await contract.claim({ from: alice });
  });
});
