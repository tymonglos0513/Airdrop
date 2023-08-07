import logo from "../Materials/Logo.png";

function Footer() {
	return (
		<div className="footersec">
			<footer>
				<div className="footerSection">
					<img src={logo} style={{ width: "4rem" }} alt="" />
					<p style={{ fontSize: "13px" }}>
						ClaimKitty. 2023. <br /> All rights are reserved.
					</p>
				</div>
				<div className="footerSection">
					<p style={{ fontSize: "13px" }}>
						{" "}
						<span style={{ fontSize: "18px" }}>
							SiteMap
						</span> <br />{" "}
						<a href="https://app.claimkitty.com/app">
							Create Airdrop
						</a>{" "}
						<br />{" "}
						<a href="https://app.claimkitty.com/user">
							Claim Airdrop
						</a>{" "}
						<br />{" "}
						<a href="https://app.claimkitty.com/minting">
							Mint NFT
						</a>{" "}
						<br />
						<a>Claim NFT</a>
					</p>
				</div>
				<div className="footerSection">
					<p style={{ fontSize: "13px" }}>
						{" "}
						<span style={{ fontSize: "18px" }}>
							Social Links
						</span>{" "}
						<br />
						<a href="https://twitter.com/ClaimKitty">
							Twitter
						</a>{" "}
						<br />{" "}
						<a
							href="https://discord.gg/7x9U8YUa
							"
						>
							Discord
						</a>
						<br />
						<a href="forum.claimkitty.com">Forum</a> <br /> <br />{" "}
					</p>
				</div>
			</footer>
		</div>
	);
}

export default Footer;
