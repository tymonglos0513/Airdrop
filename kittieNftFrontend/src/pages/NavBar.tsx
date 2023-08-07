import { useWeb3React } from "@web3-react/core";
import { useEffect } from "react";

import { injected } from "../blockchain/metamaskConnector";
import discord from "../Materials/discord.svg";
import forum from "../Materials/forum.png";
import twitter from "../Materials/twitter.svg";

// import abi file

function NavBar() {
	const { active, account, library, activate, deactivate, chainId } =
		useWeb3React();

	useEffect(() => {
		const isWalletConnected = localStorage.getItem("isWalletConnected");
		const connector = localStorage.getItem("connector");
		if (isWalletConnected === "true" && connector === "injected") {
			activate(injected);
		}
	}, [active]);

	async function connectMetamaks() {
		try {
			await activate(injected, undefined, true);
			localStorage.setItem("connector", "injected");
			localStorage.setItem("isWalletConnected", "true");
		} catch (ex) {
			console.log(ex);
		}
	}

	function getWalletAbreviation(
		walletAddress: string | null | undefined
	): string {
		if (walletAddress !== null && walletAddress !== undefined) {
			return walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4);
		}
		return "";
	}

	async function disconnectMetamaks() {
		try {
			deactivate();
			localStorage.setItem("isWalletConnected", "false");
			localStorage.removeItem("connector");
		} catch (ex) {
			console.log(ex);
		}
	}

	return (
		<div className="header">
			<div className="left_header">
				<img src={twitter} alt="Twitter" />
				<img src={discord} alt="Discord" />
				<img src={forum} alt="Forum" />
			</div>
			<div className="middle_header">
				<h1>Kitties.Vip</h1> <br /> <span>by claimkitty</span>
			</div>
			<div className="right_header">
				{active ? (
					<button className="btn" onClick={disconnectMetamaks}>
						{getWalletAbreviation(account)}
					</button>
				) : (
					<button className="btn" onClick={connectMetamaks}>
						Connect Wallet
					</button>
				)}
			</div>
		</div>
	);
}

export default NavBar;
