pragma solidity >=0.7.0 <0.9.0;

contract FairCrowdPrice {
    
    struct FairPrice {
        address keeper;
        uint256 price;
        uint256 timestamp;
    }
    
    FairPrice[] public fairPrices;
    uint256 constant reward = 1000;
    address  payable test;
    
    event NewData(FairPrice _fp);
    event Winner (address _keeper, uint256 _reward, uint _timestamp);
    
    receive () external payable {}
    fallback () external payable {}
     
  
    constructor() payable {
       payable(address(this)).transfer(msg.value);
    }
    
    function addLiquidity() external payable {
        payable(address(this)).transfer(msg.value);
    }

    function getBalance() public view returns (uint256 b) { 
        return  address(this).balance; 
    }

    function setPrice(uint256 _price)  external payable {

        FairPrice memory fp = FairPrice(msg.sender, _price, block.timestamp);
        fairPrices.push(fp);
        
        giveReward(payable(msg.sender));
        
        emit NewData(fp);
        emit Winner (msg.sender, reward, block.timestamp);
    }
    
    function giveReward (address payable to) internal {
        to.transfer(reward);
    }
    
    
}