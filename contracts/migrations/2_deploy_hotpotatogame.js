const HotPotatoGame = artifacts.require("HotPotatoGame");

module.exports = function (deployer) {
    deployer.deploy(HotPotatoGame);
};
