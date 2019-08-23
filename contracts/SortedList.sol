pragma solidity 0.5.10;

import "./SortedListDelegate.sol";


/**
 * @title SortedList
 * @author Joaquin Gonzalez (jpgonzalezra@gmail.com)
 * @dev An utility library for using sorted list data structures.
 */
library SortedList {

    uint256 private constant NULL = 0;
    uint256 private constant HEAD = 0;

    bool private constant LEFT = false;
    bool private constant RIGHT = true;

    struct List {
        // node_id => prev or next => node_id
        mapping(uint256 => mapping(bool => uint256)) list;
    }

    /**
     * @dev Checks if the node exists
     * @param self stored linked list from contract
     * @param _node a node to search for
     * @return bool true if node exists, false otherwise
     */
    function exists(List storage self, uint256 _node) internal view returns (bool) {
        if (self.list[_node][LEFT] == HEAD && self.list[_node][RIGHT] == HEAD) {
            return (self.list[HEAD][RIGHT] == _node);
        }
        return true;
    }

    /**
     * @dev Returns the number of elements in the list
     * @param self stored linked list from contract
     * @return uint256
     */
    function sizeOf(List storage self) internal view returns (uint256) {
        uint256 total;
        (, uint256 i) = getAdjacent(self, HEAD);
        while (i != HEAD) {
            (, i) = getAdjacent(self, i);
            total++;
        }
        return total;
    }

    /**
     * @dev Returns the links of a node as a tuple
     * @param self stored linked list from contract
     * @param _node id of the node to get
     * @return bool, uint256, uint256 true if node exists or false otherwise, previous node, next node
     */
    function getNode(List storage self, uint256 _node) internal view returns (bool, uint256, uint256) {
        if (!exists(self, _node)) {
            return (false, 0, 0);
        }
        return (true, self.list[_node][LEFT], self.list[_node][RIGHT]);
    }

    /**
     * @dev Returns the link of a node `_node` in direction `RIGHT`.
     * @param self stored linked list from contract
     * @param _node id of the node to step from
     * @return bool, uint256 true if node exists or false otherwise, next node
     */
    function getNextNode(List storage self, uint256 _node) internal view returns (bool, uint256) {
        return getAdjacent(self, _node);
    }

    /**
     * @dev Returns the link of a node `_node` in direction `_direction`.
     * @param self stored linked list from contract
     * @param _node id of the node to step from
     * @return bool, uint256 true if node exists or false otherwise, node in _direction
     */
    function getAdjacent(List storage self, uint256 _node) internal view returns (bool, uint256) {
        if (exists(self, _node)) {
            return (true, self.list[_node][RIGHT]);
        }
        return (false, 0);

    }

    /**
     * @dev Creates a bidirectional link between two nodes on direction `_direction` (LEFT or RIGHT)
     * @param self stored linked list from contract
     * @param _node first node for linking
     * @param _link  node to link to in the _direction
     */
    function createLink(
        List storage self,
        uint256 _node,
        uint256 _link,
        bool _direction
    ) internal {
        self.list[_link][!_direction] = _node;
        self.list[_node][_direction] = _link;
    }

    /**
     * @dev Insert node `_node`
     * @param self stored linked list from contract
     * @param _node  new node to insert
     * @return bool true if success, false otherwise
     */
    function insert(List storage self, uint256 _node, address _delegate) internal returns (bool) {
        if (exists(self, _node)) {
            return false;
        }
        uint256 position = getPosition(self, _node, _delegate);
        uint256 c = self.list[position][LEFT];
        createLink(
            self,
            position,
            _node,
            LEFT
        );
        createLink(
            self,
            _node,
            c,
            LEFT
        );
        return true;
    }

    /**
     * @dev Get the node position to add.
     * @param self stored linked list from contract
     * @param _node value to seek
     * @param _delegate the delagete instance
     * @return uint256 next node with a value less than _node
     */
    function getPosition(List storage self, uint256 _node, address _delegate) internal view returns (uint256) {
        (, uint256 next) = getAdjacent(self, HEAD);
        while (next != 0 && SortedListDelegate(_delegate).getValue(_node) > SortedListDelegate(_delegate).getValue(next)) {
            next = self.list[next][RIGHT];
        }
        return next;
    }

    /**
     * @dev Get node value given position
     * @param self stored linked list from contract
     * @param _position node position to consult
     * @param _delegate the delagete instance
     * @return uint256 the node value
     */
    function getValue(List storage self, uint256 _position, address _delegate) internal view returns (uint256) {
        (, uint256 next) = getAdjacent(self, HEAD);
        for (uint256 i = 0; i < _position; i++) {
            next = self.list[next][RIGHT];
        }
        return SortedListDelegate(_delegate).getValue(next);
    }

    /**
     * @dev Removes an entry from the sorted list
     * @param self stored linked list from contract
     * @param _node node to remove from the list
     * @return uint256 the removed node
     */
    function remove(List storage self, uint256 _node) internal returns (uint256) {
        if (_node == NULL || !exists(self, _node)) {
            return 0;
        }
        createLink(
            self,
            self.list[_node][LEFT],
            self.list[_node][RIGHT],
            RIGHT
        );
        delete self.list[_node][LEFT];
        delete self.list[_node][RIGHT];
        return _node;
    }

    /**
     * @dev Get median beetween entry from the sorted list
     * @param self stored linked list from contract
     * @param _delegate the delagete instance
     * @return uint256 the median
     */
    function median(List storage self, address _delegate) internal view returns (uint256) {
        uint256 elements = sizeOf(self);
        if (elements % 2 == 0) {
            uint256 sum = getValue(self, elements / 2, _delegate) + getValue(self, elements / 2 - 1, _delegate);
            return sum / 2;
        } else {
            return getValue(self, elements / 2, _delegate);
        }
    }

}