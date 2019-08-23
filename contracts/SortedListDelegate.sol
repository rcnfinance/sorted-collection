pragma solidity 0.5.10;

/**
 * @title SortedListDelegate
 * @author Joaquin Gonzalez (jpgonzalezra@gmail.com)
 * @dev Delegate for SortedList can know node value.
 */
interface SortedListDelegate {

    /**
     * @dev Get node value
     * @param _id node_id
     * @return uint256 the node value
     */
    function getValue(uint256 _id) external view returns (uint256);
}