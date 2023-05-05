<div align="center">
    <a href="https://ethereum.org/">
        <img src="https://user-images.githubusercontent.com/46251023/209479236-f1ef8fda-21b3-4f67-b058-3634bf0ce8d9.png" height="160"/>
    </a>
    <a href="https://reactjs.org/">
        <img src="https://user-images.githubusercontent.com/46251023/209479254-62d6f67d-fd08-4d34-a0ed-d889b8882b79.png" height="160" />
    </a>
</div>

# Hot potato

The classic game of Hot Potato, but this time the hot potato is an Ethereum non-fungible token (NFT).

## Contracts

#### Potato ERC20 (POT)

Currency used for game buy-ins. You can claim a 100 POT daily gift.

#### HotPotato ERC721 (HPT)

The undesired NFTs which, for some reason, nobody wants :man_shrugging:. Each HPT belongs to a single game, both having the same identifier (token ID == game ID).

#### HotPotatoGame

Stores game logic (create, join, start game, claim win, etc.).

## The game

Each game can have up to 8 players, one of whom will get burned by the hot potato and get the loser award.

All game transactions are done through Metamask.

### Game creation

The game starts when a leader player kicks off a game. Each game creation or join costs an entry worth 20 POT, so if you want to create a game, make sure you can afford it.

![create](https://user-images.githubusercontent.com/46251023/209584354-fc797a3e-a60e-4adb-9b72-61930cbc36e4.gif)

### Joining game

Log in to your account, make sure you have 20 POT, and paste in the game ID previously sent to you by the leader player. Click join, approve transactions, and you are in.

![join](https://user-images.githubusercontent.com/46251023/209585517-0cc7489f-1341-4555-9959-d13920ca1c98.gif)

### Starting game

Once players have joined, the leader player will go ahead and click start game. This will start the game for all players. A randomly chosen player will be honored with starting off with the hot potato in hands.

![start](https://user-images.githubusercontent.com/46251023/209584841-096bebe0-92e1-46f3-95a5-8ff52a1d6106.gif)

### Transfering hot potato

Most of the time, NFTs come as a benefit, but this is not the case. The one who has it gets the humiliation, so free yourself from it ASAP. Just click on the unfortunate player and send him a warm gift :fire: after approving the transaction.

![transfer](https://user-images.githubusercontent.com/46251023/209584846-a6eacd22-8a7e-4b82-8365-02518b99b0e7.gif)

### Game ending

The hot potato can burn someone at any time; once it does, the game ends and winners can claim the bounty of the loser's ticket worth of POT, split among the winners.

![end-and-claim](https://user-images.githubusercontent.com/46251023/209585578-c8999958-c55f-4450-84b3-c5b564f54bf4.gif)
