// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// create a new smart contract
contract Ethcommerce {
    // declare address var 4 owner of the project
    address public owner;
      
    // create a struct to define all props for ea. store product
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    // store products inside the smart contract 
    mapping(uint256 => Item) public items; 
    // mapping to store all orders
    mapping(address => mapping(uint256 => Order)) public orders;
    //mapping to keep track of all orders 
    mapping(address => uint256) public orderCount; 

     // emitted every time a product is brought
    event Buy(address buyer, uint256 orderId, uint256 itemId);

      //struct for orders
    struct Order {
        uint256 time;
        Item item;
    }
    // once a product has been listed successfully 
    event List(string name, uint256 cost, uint256 quantity);

    //create a modifier ensure owner can only list items in the store
    modifier onlyOwner() {
        require((msg.sender == owner));
        _;
    }

      constructor() {
            owner = msg.sender;
        }

     //LISTING PRODUCTS
    //Create a new product item and add it to the mapping of items
    function list(
       uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        //Create item 
        Item memory item = Item(
            _id, _name, _category, _image, _cost, _rating, _stock
        );
        // Add item to mapping
        items[_id] = item;
        //emit event
        emit List(_name, _cost, _stock);
    }

    // BUYING PRODUCTS 
    function buy(uint256 _id) public payable {
        //fetch item using id from the mapping of items
        Item memory item =items[_id];

        //require enough ethr to buy item
        require((msg.value >= item.cost));

        //require the item to be in stock 
        require(item.stock >0);

        //create order
        Order memory order = Order(block.timestamp, item);

        //add order for user 
        orderCount[msg.sender]++; // Order ID
        orders[msg.sender][orderCount[msg.sender]] = order;

        //subtract from stock
        items[_id].stock = item.stock - 1; 

        //emit event to indicstr a successful purchase
        emit Buy(msg.sender, orderCount[msg.sender], item.id);

    }

    //WITHDRAWING
    function withdraw() public onlyOwner{
        (bool success, ) = owner.call{value: address(this).balance}("");
        require((success));
    }

    



}
