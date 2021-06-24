const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    from:'0x2152e4227c2866d77e4a68cb28371b5082b73aa0',
    develop: {
      port: 7575
    }
  },
  compilers: {
    solc: {
      version: '0.8.4' // ex:  "0.4.20". (Default: Truffle's installed solc)
    }
  }
};
