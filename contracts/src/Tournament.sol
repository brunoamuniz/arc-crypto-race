// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Tournament
 * @dev ARC CRYPTO RACE Tournament Contract
 * Manages daily tournaments, entry fees, checkpoints, and prize distribution
 */
contract Tournament is Ownable {
    IERC20 public usdc;
    uint256 public constant ENTRY_FEE = 5 * 1e6; // 5 USDC (6 decimals)
    uint256 public constant SITE_FEE_BPS = 1000; // 10% (1000 basis points)
    
    // Prize distribution (basis points)
    uint256 public constant FIRST_PLACE_BPS = 6000;  // 60%
    uint256 public constant SECOND_PLACE_BPS = 2500; // 25%
    uint256 public constant THIRD_PLACE_BPS = 1500;  // 15%
    
    // Track if user has entered a specific day
    mapping(uint256 => mapping(address => bool)) public hasEntered;
    
    struct DayInfo {
        uint256 totalPool;
        bool finalized;
        bytes32[] checkpoints;
        address[3] winners;
        uint256[3] winnerScores;
    }
    
    mapping(uint256 => DayInfo) public dayInfo;
    
    event TournamentEntered(uint256 indexed dayId, address indexed player, uint256 entryFee);
    event CheckpointCommitted(uint256 indexed dayId, bytes32 indexed leaderboardHash);
    event DayFinalized(
        uint256 indexed dayId,
        address[3] winners,
        uint256[3] scores,
        uint256 totalPool,
        uint256 siteFee
    );
    
    constructor(address _usdc, address _owner) Ownable(_owner) {
        require(_usdc != address(0), "USDC address cannot be zero");
        usdc = IERC20(_usdc);
    }
    
    /**
     * @dev Enter the tournament for a specific day
     * @param dayId The day identifier (e.g., 20251211)
     */
    function enterTournament(uint256 dayId) external {
        require(!hasEntered[dayId][msg.sender], "Already entered today");
        require(!dayInfo[dayId].finalized, "Day already finalized");
        
        // Transfer entry fee from user to contract
        require(
            usdc.transferFrom(msg.sender, address(this), ENTRY_FEE),
            "USDC transfer failed"
        );
        
        // Mark as entered and increase pool
        hasEntered[dayId][msg.sender] = true;
        dayInfo[dayId].totalPool += ENTRY_FEE;
        
        emit TournamentEntered(dayId, msg.sender, ENTRY_FEE);
    }
    
    /**
     * @dev Commit a checkpoint (leaderboard hash) for transparency
     * @param dayId The day identifier
     * @param leaderboardHash Hash of the current leaderboard state
     */
    function commitCheckpoint(uint256 dayId, bytes32 leaderboardHash) external onlyOwner {
        require(!dayInfo[dayId].finalized, "Day already finalized");
        
        dayInfo[dayId].checkpoints.push(leaderboardHash);
        
        emit CheckpointCommitted(dayId, leaderboardHash);
    }
    
    /**
     * @dev Finalize a day and distribute prizes
     * @param dayId The day identifier
     * @param winners Array of 3 winner addresses [1st, 2nd, 3rd]
     * @param scores Array of 3 winner scores [1st, 2nd, 3rd]
     */
    function finalizeDay(
        uint256 dayId,
        address[3] calldata winners,
        uint256[3] calldata scores
    ) external onlyOwner {
        DayInfo storage day = dayInfo[dayId];
        
        require(!day.finalized, "Day already finalized");
        require(day.totalPool > 0, "No entries for this day");
        
        // Validate winners (no zero addresses)
        require(winners[0] != address(0), "Invalid winner 1");
        require(winners[1] != address(0), "Invalid winner 2");
        require(winners[2] != address(0), "Invalid winner 3");
        
        // Calculate site fee (10%)
        uint256 siteFee = (day.totalPool * SITE_FEE_BPS) / 10000;
        uint256 prizePool = day.totalPool - siteFee;
        
        // Calculate prize amounts
        uint256 firstPrize = (prizePool * FIRST_PLACE_BPS) / 10000;
        uint256 secondPrize = (prizePool * SECOND_PLACE_BPS) / 10000;
        uint256 thirdPrize = (prizePool * THIRD_PLACE_BPS) / 10000;
        
        // Transfer site fee to owner
        if (siteFee > 0) {
            require(usdc.transfer(owner(), siteFee), "Site fee transfer failed");
        }
        
        // Transfer prizes to winners
        if (firstPrize > 0) {
            require(usdc.transfer(winners[0], firstPrize), "First prize transfer failed");
        }
        if (secondPrize > 0) {
            require(usdc.transfer(winners[1], secondPrize), "Second prize transfer failed");
        }
        if (thirdPrize > 0) {
            require(usdc.transfer(winners[2], thirdPrize), "Third prize transfer failed");
        }
        
        // Store winners and scores
        day.winners = winners;
        day.winnerScores = scores;
        day.finalized = true;
        
        emit DayFinalized(dayId, winners, scores, day.totalPool, siteFee);
    }
    
    /**
     * @dev Get day information
     * @param dayId The day identifier
     * @return totalPool Total prize pool for the day
     * @return finalized Whether the day is finalized
     * @return checkpointCount Number of checkpoints
     * @return winners Array of 3 winners
     * @return winnerScores Array of 3 winner scores
     */
    function getDayInfo(uint256 dayId)
        external
        view
        returns (
            uint256 totalPool,
            bool finalized,
            uint256 checkpointCount,
            address[3] memory winners,
            uint256[3] memory winnerScores
        )
    {
        DayInfo storage day = dayInfo[dayId];
        return (
            day.totalPool,
            day.finalized,
            day.checkpoints.length,
            day.winners,
            day.winnerScores
        );
    }
    
    /**
     * @dev Get checkpoint at index
     * @param dayId The day identifier
     * @param index Checkpoint index
     * @return The checkpoint hash
     */
    function getCheckpoint(uint256 dayId, uint256 index)
        external
        view
        returns (bytes32)
    {
        return dayInfo[dayId].checkpoints[index];
    }
}

