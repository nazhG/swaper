const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { ethers, upgrades } = require("hardhat");

const IERC20 = artifacts.require("IERC20");
const Roter02 = artifacts.require("IUniswapV2Router02");
const IBPool = artifacts.require("IBPool");

const Bpool = "0xA3F9145CB0B50D907930840BB2dcfF4146df8Ab4";
const Uniswap = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const ALBT = '0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0';
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

describe("V2", () => {
	let swapper;
	let bpool;
	let amountToBuy;

	let user;
	let recipient;

	before(async () => {
		[user, recipient] = await ethers.getSigners();

		const Swapper = await ethers.getContractFactory("Swapper");
		swapper = await upgrades.deployProxy(Swapper, [recipient.address, Uniswap]);
		await swapper.deployed();

		const SwapperUpgrade = await ethers.getContractFactory("SwapperUpgrade");
		swapper = await upgrades.upgradeProxy(swapper.address, SwapperUpgrade);
		console.log("upgraded =>", swapper.address);

		uniswap = await Roter02.at(Uniswap);
		balancer = await IBPool.at(Bpool);
	});

	describe("Balancer", () => {

		it("Swap", async () => {
			let etherAmount = "1";
			let toToken = DAI;
			const dai = await IERC20.at(DAI);

			let prevBalanceudai = await dai.balanceOf(user.address);

			await swapper.connect(user).swapOneByBalancer(web3.utils.toWei(etherAmount), toToken, { value: web3.utils.toWei(etherAmount) });

			let postBalanceudai = await dai.balanceOf(user.address);
			console.log('DAI  Balance previo: ', (prevBalanceudai).toString(), 'Balance posterior: ', (postBalanceudai).toString())
			assert(
				Number(prevBalanceudai) < Number(postBalanceudai)
			);
		})

	})
});