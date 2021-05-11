const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { ethers, upgrades } = require("hardhat");

const IERC20 = artifacts.require("IERC20");
const Roter02 = artifacts.require("IUniswapV2Router02");

const Uniswap = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const ALBT = '0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0';
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

describe("LET SWAPPING BABY !!!\nV1", () => {
	let swapper;
	let uniswap;
	let amountToBuy;

	let user;
	let recipient;

	before(async () => {
		[user, recipient] = await ethers.getSigners();

		const Swapper = await ethers.getContractFactory("Swapper");
		swapper = await upgrades.deployProxy(Swapper, [recipient.address, Uniswap]);
		await swapper.deployed();

		uniswap = await Roter02.at(Uniswap);
	});

	describe("Uniswap", () => {

		it("Quote token", async () => {
			let etherAmount = "1";
			let x = await uniswap.getAmountsOut(web3.utils.toWei(etherAmount), [WETH, ALBT]);
			amountToBuy = String(x[1]);
			// Tokens available
		})

		it("Swap one", async () => {
			let etherAmount = "1";
			const albt = await IERC20.at(ALBT);

			let prevBalance = await albt.balanceOf(user.address);
			let prevBalanceRecipient = await recipient.getBalance();
			await swapper.connect(user).swapOneByUniswap(ALBT, { value: web3.utils.toWei(etherAmount) });

			let postBalance = await albt.balanceOf(user.address);
			let postBalanceRecipient = await recipient.getBalance();

			assert(Number(prevBalance) < Number(postBalance) && Number(prevBalanceRecipient) < Number(postBalanceRecipient));
		})

		it("Swap many", async () => {
			let etherAmount = "1";
			let toToken = [USDC, USDT, DAI];
			let porcToken = [40, 40, 20];
			let amounts = [];
			for (let i = 0; i < toToken.length; i++) {
				let eth = (parseInt(web3.utils.toWei(etherAmount)) * porcToken[i]) / 100;
				let x = await uniswap.getAmountsOut(String(eth), [WETH, toToken[i]]);
				amounts.push(String(x[1]));
			}
			const usdc = await IERC20.at(USDC);
			const dai = await IERC20.at(DAI);
			const usdt = await IERC20.at(USDT);

			let prevBalanceusdc = await usdc.balanceOf(user.address);
			let prevBalanceudai = await dai.balanceOf(user.address);
			let prevBalanceusdt = await usdt.balanceOf(user.address);

			await swapper.connect(user).swapManyByUniswap(toToken, porcToken, { value: web3.utils.toWei(etherAmount) });
			let postBalanceusdc = await usdc.balanceOf(user.address);
			let postBalanceudai = await dai.balanceOf(user.address);
			let postBalanceusdt = await usdt.balanceOf(user.address);
			console.log('USDC Balance previo: ', (prevBalanceusdc).toString(), 'Balance posterior: ', (postBalanceusdc).toString())
			console.log('DAI  Balance previo: ', (prevBalanceudai).toString(), 'Balance posterior: ', (postBalanceudai).toString())
			console.log('USDT Balance previo: ', (prevBalanceusdt).toString(), 'Balance posterior: ', (postBalanceusdt).toString())
			assert(
				Number(prevBalanceusdc) < Number(postBalanceusdc) &&
				Number(prevBalanceusdt) < Number(postBalanceusdt)
			);
		})

	})
});