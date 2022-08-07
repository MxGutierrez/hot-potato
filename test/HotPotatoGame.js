const hotPotatoGame = artifacts.require("./HotPotatoGame.sol");
const hotPotato = artifacts.require("./HotPotato.sol");

contract("HotPotatoGame", async (accounts) => {
  let contract;
  let hotPotatoContract;
  let gameId;
  const [owner, alice, bob] = accounts;

  beforeEach("Setup contract", async () => {
    contract = await hotPotatoGame.new();
    hotPotatoContract = await hotPotato.at(await contract._hotPotatoContract());
    gameId = (
      await contract.createGame({ from: owner })
    ).logs[0].args.gameId.toString();
  });

  it("Should create game", async () => {
    const receipt = await contract.createGame({ from: owner });

    assert.equal(receipt.logs.length, 2, "2 events should have been emitted");

    assert.equal(
      receipt.logs[0].event,
      "GameCreated",
      "1st event should be GameCreated"
    );
    assert.notEqual(
      receipt.logs[0].args.gameId.toString(),
      null,
      "Game id should be created"
    );

    assert.equal(
      receipt.logs[1].event,
      "PlayerJoined",
      "2nd event should be PlayerJoined"
    );
    assert.equal(
      receipt.logs[1].args.player,
      owner,
      "Game creator should have joined"
    );
  });

  it("Unstarted game hasn't ended", async () => {
    const hasGameEnded = await contract.hasGameEnded(gameId);
    assert(!hasGameEnded, "Game shouldn't be ended");
  });

  it("Should allow players to join", async () => {
    const aliceReceipt = await contract.joinGame(gameId, { from: alice });

    assert.equal(
      aliceReceipt.logs.length,
      1,
      "1 event should have been emitted"
    );
    assert.equal(
      aliceReceipt.logs[0].event,
      "PlayerJoined",
      "Event should be PlayerJoined"
    );
    assert.equal(
      aliceReceipt.logs[0].args.player,
      alice,
      "Alice should have joined"
    );

    const bobReceipt = await contract.joinGame(gameId, { from: bob });

    assert.equal(bobReceipt.logs.length, 1, "1 event should have been emitted");
    assert.equal(
      bobReceipt.logs[0].event,
      "PlayerJoined",
      "Event should be PlayerJoined"
    );
    assert.equal(bobReceipt.logs[0].args.player, bob, "Bob should have joined");

    const joinedPlayers = await contract.getPlayers(gameId);
    assert.equal(joinedPlayers.length, 3, "3 players should have joined");
    assert(
      [owner, alice, bob].every((address) => joinedPlayers.includes(address)),
      "Joined players should be owner, alice & bob"
    );
  });

  it("Shouldn't allow starting game with past expiration date", async () => {
    // Join player to avoid single-game player error
    await contract.joinGame(gameId, { from: alice });

    try {
      await contract.startGame(
        gameId,
        1,
        Math.floor(
          new Date(new Date().setDate(new Date().getDate() - 1)).getTime() /
            1000
        ) // Remove 1 day from now
      );

      assert(false, "Should return error");
    } catch (ex) {
      assert(
        ex.message.includes("Expiration time should be in the future"),
        "Should return expiration time should be in the future error"
      );
    }
  });

  it("Shouldn't allow starting game with 1 player", async () => {
    try {
      await contract.startGame(
        gameId,
        1,
        Math.floor(
          new Date(new Date().setDate(new Date().getDate() + 3)).getTime() /
            1000
        ) // Add 3 days from now
      );

      assert(false, "Should return error");
    } catch (ex) {
      assert(
        ex.message.includes("Not enough players"),
        "Should return not enough players error"
      );
    }
  });

  it("Shouldn't allow starting game with more or equal hot potatos than players", async () => {
    try {
      await contract.joinGame(gameId, { from: alice });
      await contract.startGame(
        gameId,
        2,
        Math.floor(
          new Date(new Date().setDate(new Date().getDate() + 3)).getTime() /
            1000
        )
      );

      assert(false, "Should return error");
    } catch (ex) {
      assert(
        ex.message.includes("Too many hot potatoes"),
        "Should return Too many hot potatoes error"
      );
    }
  });

  it("Should start game", async () => {
    await contract.joinGame(gameId, { from: alice });
    await contract.joinGame(gameId, { from: bob });

    const receipt = await contract.startGame(
      gameId,
      1,
      Math.floor(
        new Date(new Date().setDate(new Date().getDate() + 3)).getTime() / 1000
      ) // Add 3 days from now
    );

    assert.equal(receipt.logs.length, 1, "There should be 1 emitted event");
    assert.equal(
      receipt.logs[0].event,
      "GameStarted",
      "Should emit GameStarted event"
    );
    assert.equal(
      receipt.logs[0].args.gameId,
      gameId,
      "Should start gameId game"
    );
  });

  it("Shouldn't allow joining game after game started", async () => {
    await contract.joinGame(gameId, { from: alice });
    await contract.startGame(
      gameId,
      1,
      Math.floor(
        new Date(new Date().setDate(new Date().getDate() + 3)).getTime() / 1000
      )
    );

    try {
      await contract.joinGame(gameId, { from: bob });

      assert(false, "Shouldn't allow joining game");
    } catch (ex) {
      assert(
        ex.message.includes("Game already started"),
        "Should return game already started error"
      );
    }
  });

  it("Starting game should distribute hot potatoes to players", async () => {
    await contract.joinGame(gameId, { from: alice });
    await contract.joinGame(gameId, { from: bob });

    const hotPotatoCount = 2;

    await contract.startGame(
      gameId,
      hotPotatoCount,
      Math.floor(
        new Date(new Date().setDate(new Date().getDate() + 3)).getTime() / 1000
      )
    );

    const balances = (
      await hotPotatoContract.balanceOfBatch(
        [owner, alice, bob],
        Array(3).fill(gameId)
      )
    ).map((b) => b.toNumber());

    assert.equal(
      balances.filter((b) => b === 1).length,
      hotPotatoCount,
      "Hot potato count doesn't match the amount distributed"
    );

    assert.equal(
      balances.reduce((acc, b) => acc + b, 0),
      hotPotatoCount,
      "Summed balances should be equal to hot potato count"
    );
  });
});
