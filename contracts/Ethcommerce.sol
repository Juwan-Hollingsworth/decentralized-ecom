// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Main contract for ecommerce platform
contract Ethcommerce {
    // declare address var 4 owner of the contract
    address public owner;
      
    // Define the structure for products/items in the store
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    // store products inside the smart contract: Maps items ID to Item struct
    mapping(uint256 => Item) public items; 
    // mapping to store orders: map user address to their order history 
    mapping(address => mapping(uint256 => Order)) public orders;
    //mapping to track number of orders per user address
    mapping(address => uint256) public orderCount; 

     // emitted every time a purchase is made
     // Helps frontend track purchases and update UI
    event Buy(address buyer, uint256 orderId, uint256 itemId);

      //structure to store order details
    struct Order {
        uint256 time; //order timestamp
        Item item; //item that was purchased
    }
    // event emitted when a new product is listed 
    //helps the frontend track new items and update inventory 
    event List(string name, uint256 cost, uint256 quantity);

    //create a modifier ensure owner can only list items in the store
    modifier onlyOwner() {
        require((msg.sender == owner));
        _;
    }
    // constructor runs once when contract is deployed 
    // sets the deployers address as the owner
      constructor() {
            owner = msg.sender;
        }

     //-----LISTING PRODUCTS
    //Create a new product item and add it to the mapping of items
    //only the owner can call this fx (enforced by onlyOwner mod)
    function list(
       uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        //create a new item with the provicded parameters
        Item memory item = Item(
            _id, _name, _category, _image, _cost, _rating, _stock
        );
        // store the item in the items mapping using its ID
        items[_id] = item;
        //emit event to notidfy frontend of new listing 
        emit List(_name, _cost, _stock);
    }

    //----BUYING PRODUCTS: Fx for users to purchase items
    //must send enough ETH with the transaction
    function buy(uint256 _id) public payable {
        //fetch item using id from the mapping of items storage
        Item memory item =items[_id];

        //check if user sent enough eth to cover item cost
        require((msg.value >= item.cost));

        //verify item is available in stock
        require(item.stock >0);

        //create order with current timestamp and item details
        Order memory order = Order(block.timestamp, item);

        //add order for user 
        orderCount[msg.sender]++; // Order ID
        // store the order in the orders mapping
        orders[msg.sender][orderCount[msg.sender]] = order;

        //subtract from stock
        items[_id].stock = item.stock - 1; 

        //emit event to indicstr a successful purchase for frontend
        emit Buy(msg.sender, orderCount[msg.sender], item.id);

    }

    //---WITHDRAWING: Fx for owner to withdraw accumulated eth from sales
    function withdraw() public onlyOwner{
        (bool success, ) = owner.call{value: address(this).balance}("");
        require((success));
    }

    



}
