const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { ethers, upgrades } = require("hardhat");

const ERC20 = artifacts.require("ERC20");

const IBPool = artifacts.require("IBPool");
const Roter02 = artifacts.require("IUniswapV2Router02");
const ExchangeProxy = artifacts.require("ExchangeProxy");

const Balancer = "0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21";
const Uniswap = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const ALBT = '0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0';
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

describe("V2", () => {
	let swapper;
	let balancer;
	let amountToBuy;

	let owner;
	let recipient;

	before(async () => {
		[owner, recipient] = await ethers.getSigners();

		const Swapper = await ethers.getContractFactory("Swapper");
		swapper = await upgrades.deployProxy(Swapper, [recipient.address, Uniswap]);
		await swapper.deployed();

		const SwapperUpgrade = await ethers.getContractFactory("SwapperUpgrade");
		swapper = await upgrades.upgradeProxy(swapper.address, SwapperUpgrade);
		console.log("upgraded =>", swapper.address);

		swapper.setBalancer(Balancer); //v2

		uniswap = await Roter02.at(Uniswap);
		balancer = await ExchangeProxy.at(Balancer);
	});

	describe("Balancer", () => {

		it("Swap", async () => {
			let etherAmount = "1";
			let accountBalance = [];

			const tokenAddrss = DAI;
			const token = await ERC20.at(tokenAddrss);

			accountBalance.push(Number(await token.balanceOf(owner.address)));
			// console.log([await swapper.owner()]);
			totalOutput = await swapper.connect(owner).swapOneByBalancer(tokenAddrss, { value: web3.utils.toWei(String(etherAmount)) });
			console.log(totalOutput);

			accountBalance.push(Number(await token.balanceOf(owner.address)));
			console.table(accountBalance)
			// assert(Number(accountBalance[0]) < Number(accountBalance[1]));
		})

	})
});