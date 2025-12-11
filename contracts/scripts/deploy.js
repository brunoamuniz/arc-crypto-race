const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  
  if (signers.length === 0) {
    throw new Error("No signers found. Check PRIVATE_KEY in .env");
  }
  
  const deployer = signers[0];
  
  console.log("Deploying contracts with account:", deployer.address);
  
  try {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  } catch (error) {
    console.log("Could not fetch balance (this is OK for some networks)");
  }

  // USDC ERC-20 interface address on ARC Testnet
  // Official address from: https://docs.arc.network/arc/references/contract-addresses
  // This is the optional ERC-20 interface for interacting with native USDC balance (uses 6 decimals)
  const USDC_ADDRESS = process.env.USDC_ADDRESS || "0x3600000000000000000000000000000000000000";
  
  if (!USDC_ADDRESS || USDC_ADDRESS === "0x...") {
    throw new Error("USDC_ADDRESS must be set in .env");
  }
  
  // Deploy Tournament contract
  const Tournament = await hre.ethers.getContractFactory("Tournament");
  const tournament = await Tournament.deploy(USDC_ADDRESS, deployer.address);

  await tournament.waitForDeployment();

  const address = await tournament.getAddress();
  console.log("Tournament deployed to:", address);
  
  // Save deployment info
  console.log("\nDeployment Info:");
  console.log("Contract Address:", address);
  console.log("USDC Address:", USDC_ADDRESS);
  console.log("Owner:", deployer.address);
  console.log("\nAdd to .env:");
  console.log(`NEXT_PUBLIC_TOURNAMENT_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

