import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // Deploy mock USDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("MockUSDC:", usdcAddr);

  // Faucet mint to deployer for convenience
  await (await usdc.faucet()).wait();

  // Deploy factory
  const Factory = await ethers.getContractFactory("MarketFactory");
  const factory = await Factory.deploy(usdcAddr, deployer.address);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("Factory:", factoryAddr);

  // Create a sample market closing in 1 hour
  const closeTime = Math.floor(Date.now() / 1000) + 3600;
  const tx = await factory.createMarket("Will BTC be above $100,000 on 2026-01-01? (DEMO)", closeTime);
  const receipt = await tx.wait();
  const ev = receipt?.logs
    .map((l) => {
      try {
        return factory.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .find((x) => x?.name === "MarketCreated");

  const marketAddr = ev?.args?.market as string | undefined;
  if (!marketAddr) throw new Error("Could not read MarketCreated event");
  console.log("Sample market:", marketAddr);

  // Add initial liquidity (1000 mUSDC)
  const BinaryMarket = await ethers.getContractFactory("BinaryMarket");
  const market = BinaryMarket.attach(marketAddr);
  const amount = BigInt(1_000) * BigInt(10 ** 6);
  await (await usdc.approve(marketAddr, amount)).wait();
  await (await market.addLiquidity(amount)).wait();
  console.log("Added liquidity:", amount.toString());

  const out = {
    network: "localhost",
    collateral: usdcAddr,
    factory: factoryAddr,
    sampleMarket: marketAddr
  };
  fs.writeFileSync("deployed.local.json", JSON.stringify(out, null, 2));
  console.log("Wrote deployed.local.json");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
