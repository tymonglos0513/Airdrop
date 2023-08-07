import { useWeb3React } from "@web3-react/core";
import KittieNftAbi from "../blockchain/abi/KittieNft.json";
import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import {
  KittieNft1Address,
  KittieNft2Address,
  KittieNft3Address,
} from "../blockchain/addresses";
import { formatEther, parseEther } from "ethers";

function ClaimPage() {
  const { active, account, library, activate, deactivate, chainId } =
    useWeb3React();

  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [claimableAmount, setClaimableAmount] = useState("0");
  const [claimableAmount1, setClaimableAmount1] = useState("0");
  const [claimableAmount2, setClaimableAmount2] = useState("0");
  const [claimableAmount3, setClaimableAmount3] = useState("0");

  let kittieNft1: any;
  let kittieNft2: any;
  let kittieNft3: any;

  const getClaimableAmount = async () => {
    var claimable1 = await kittieNft1.methods
      .getAllClaimableRewards(account)
      .call();
    setClaimableAmount1(claimable1);
    var claimable2 = await kittieNft2.methods
      .getAllClaimableRewards(account)
      .call();

    setClaimableAmount2(claimable2);
    var claimable3 = await kittieNft3.methods
      .getAllClaimableRewards(account)
      .call();
    setClaimableAmount3(claimable3);

    setClaimableAmount(formatEther(claimable1 + claimable2 + claimable3));
  };

  if (library) {
    kittieNft1 = new library.eth.Contract(KittieNftAbi, KittieNft1Address);
    kittieNft2 = new library.eth.Contract(KittieNftAbi, KittieNft2Address);
    kittieNft3 = new library.eth.Contract(KittieNftAbi, KittieNft3Address);
    getClaimableAmount();
  }

  const claimRewards = async () => {
    setIsClaimLoading(true);
    if (parseInt(claimableAmount1) > 0) {
      await kittieNft1.methods
        .claimAllRewards()
        .send({ from: account })
        .then(
          (res: any) => {
            console.log(res);
            toast.success("Claimed Successfully");
            setIsClaimLoading(false);
          },
          (err: any) => {
            console.log(err);
            toast.error(err.message);
            setIsClaimLoading(false);
          }
        );
    }
	if (parseInt(claimableAmount2) > 0) {
		await kittieNft3.methods
		  .claimAllRewards()
		  .send({ from: account })
		  .then(
			(res: any) => {
			  console.log(res);
			  toast.success("Claimed Successfully");
			  setIsClaimLoading(false);
			},
			(err: any) => {
			  console.log(err);
			  toast.error(err.message);
			  setIsClaimLoading(false);
			}
		  );
	  }
	  if (parseInt(claimableAmount3) > 0) {
		await kittieNft3.methods
		  .claimAllRewards()
		  .send({ from: account })
		  .then(
			(res: any) => {
			  console.log(res);
			  toast.success("Claimed Successfully");
			  setIsClaimLoading(false);
			},
			(err: any) => {
			  console.log(err);
			  toast.error(err.message);
			  setIsClaimLoading(false);
			}
		  );
	  }
  };

  return (
    <div className="container-background">
      <div className="claim_reward">
        <div>
          <h1>Claim NFT Holding rewards</h1>
          <div className="claim_box">
            <p>
              The royalties derived from NFTs sales on the marketplaces will be
              equally distributed among holders. All you need to do is buy{" "}
              <br /> and hold your Bast.Club NFT and claim your passive incomes
              on this page. Just see the amounts of Eth to claim here and
              execute the transaction.
            </p>{" "}
            <br />
            <p>Amount of ETH to claim: {claimableAmount} ETH</p>
            <div className="btn_design">
              <button className="claim_btn" onClick={claimRewards}>
                Claim your Reward
                {isClaimLoading ? <div className="loader"></div> : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimPage;
