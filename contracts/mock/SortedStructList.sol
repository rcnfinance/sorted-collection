pragma solidity 0.5.10;

import "./../SortedList.sol";
import "./../SortedListDelegate.sol";


contract SortedStructListMock is SortedListDelegate {
    using SortedList for SortedList.List;
    // mapping of id => value
    mapping(uint256 => uint256) internal nodes;
    SortedList.List private list;
    uint256 public id = 0;

    function newNode(uint256 _value) external returns (uint256) {
        id = id + 1;
        nodes[id] = _value;
        return id;
    }

    function getValue(uint256 _id) external view returns (uint256) {
        return nodes[_id];
    }

    function exists(uint256 _id) external view returns (bool) {
        return list.exists(_id);
    }

    function sizeOf() external view returns (uint256) {
        return list.sizeOf();
    }

    function insert(uint256 _id) external {
        list.insert(_id, address(this));
    }

    function getNode(uint256 _id) external view returns (bool, uint256, uint256) {
        return list.getNode(_id);
    }

    function getNextNode(uint256 _id) external view returns (bool, uint256) {
        return list.getNextNode(_id);
    }

    function remove(uint256 _id) external returns (uint256) {
        return list.remove(_id);
    }

    function median() external view returns (uint256) {
        return list.median(address(this));
    }

}