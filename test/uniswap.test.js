const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { ethers, upgrades } = require("hardhat");

const IERC20 = artifacts.require("IERC20");
const UniswapRoter = artifacts.require("IUniswapV2Router");

const Aggregator = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
const UniswapDir = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const ALBT = '0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const UNI = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

describe("Swapper", () => {
	let swapper;
	let uniswap;
	let amountToBuy;

	let user;
	let recipient;
	let addrs;

	before(async () => {
		[user, recipient, ...addrs] = await ethers.getSigners();

		const Swapper = await ethers.getContractFactory("Swapper");
		swapper = await upgrades.deployProxy(Swapper, [recipient.address, UniswapDir]);
		await swapper.deployed();

		uniswap = await UniswapRoter.at(UniswapDir);
	});

	describe("ERC20", () => {

		it("Should get amount of tokens to buy with 1 ETH", async () => {
			let etherAmount = "1";
			let x = await uniswap.getAmountsOut(web3.utils.toWei(etherAmount), [WETH, ALBT]);
			amountToBuy = String(x[1]);
			console.log(`Tokens available to buy`, amountToBuy)
		})

		// it("Should not execute with 0 ETH", async () => {
		// 	await expectRevert(
		// 		swapper.connect(user).makeSwap(ALBT, amountToBuy, { value: 0 }),
		// 		"Not enough ETH"
		// 	)
		// })

		it("Should buy only 1 token", async () => {
			let etherAmount = "1";
			const albt = await IERC20.at(ALBT);

			let prevBalance = await albt.balanceOf(user.address);
			let prevBalanceRecipient = await recipient.getBalance();
			await swapper.connect(user).makeSwap(ALBT, amountToBuy, { value: web3.utils.toWei(etherAmount) });

			let postBalance = await albt.balanceOf(user.address);
			let postBalanceRecipient = await recipient.getBalance();

			console.log(`Final balance`, web3.utils.fromWei(postBalance))
			assert(Number(prevBalance) < Number(postBalance) && Number(prevBalanceRecipient) < Number(postBalanceRecipient));
		})

		// it("Should buy several tokens", async () => {
		// 	let etherAmount = "1";
		// 	let toToken = [USDC, USDT];
		// 	let porcToken = [40, 50];
		// 	let amounts = [];
		// 	for (let i = 0; i < toToken.length; i++) {
		// 		let eth = (parseInt(web3.utils.toWei(etherAmount)) * porcToken[i]) / 100;
		// 		let x = await uniswap.getAmountsOut(String(eth), [WETH, toToken[i]]);
		// 		amounts.push(String(x[1]));
		// 	}
		// 	const usdc = await IERC20.at(USDC);
		// 	const usdt = await IERC20.at(USDT);

		// 	let prevBalanceusdc = await usdc.balanceOf(user.address);
		// 	let prevBalanceusdt = await usdt.balanceOf(user.address);
		// 	let prevBalanceRecipient = await recipient.getBalance();

		// 	await swapper.connect(user).makeMultiSwap(toToken, porcToken, amounts, { value: web3.utils.toWei(etherAmount) });

		// 	let postBalanceusdc = await usdc.balanceOf(user.address);
		// 	let postBalanceusdt = await usdt.balanceOf(user.address);
		// 	let postBalanceRecipient = await recipient.getBalance();

		// 	assert(
		// 		Number(prevBalanceusdc) < Number(postBalanceusdc) &&
		// 		Number(prevBalanceusdt) < Number(postBalanceusdt)
		// 	);
		// })

	})
});