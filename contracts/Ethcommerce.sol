// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// create a new smart contract
contract Ethcommerce {
    // declare address var 4 owner of the project
    address public owner;
        constructor() {
            owner = msg.sender;
        }
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

    //create a modifier ensure owner can only list items in the store
    modifier onlyOwner() {
        require((msg.sender == owner));
        _;
    }

    //LISTING PRODUCTS
    // store products inside the smart contract 
    mapping(uint256 => Item) public items; 
    // once a product has been listed successfully 
    event List(string name, uint256 cost, uint256 quantity);

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
}
