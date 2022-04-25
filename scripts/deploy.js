async function main() {
  const Greeter = await hre.ethers.getContractFactory("MyNFT");
  const greeter = await Greeter.deploy();

  await greeter.deployed();

  console.log("NFT deployed to:", greeter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
