import { Header } from 'app/components/Header';
import { Footer } from 'app/components/Footer';
import * as React from 'react';
import { useAccount, useContract, useProvider, useSigner } from 'wagmi';
import contractABI from 'app/contract/contractABI.json';
import merkleChildABI from 'app/contract/merkleChildABI.json';
import erc20ABI from 'app/contract/erc20ABI.json';
import { parseUnits } from 'ethers/lib/utils';
import { createLeaf, createMerkleTree } from 'app/merkleTree';
import { BigNumber, ethers } from 'ethers';
import { ErrorCode } from '@ethersproject/logger';
import { useContractAddress } from 'app/hooks/useContractAddress';
import { AppWrapper } from 'app/components/AppWrapper/AppWrapper';
import { NULL_ADDRESS, DOMAIN_NAME } from 'app/globals';
import axios from 'axios';

class SimpleError extends Error {
  message: string;
  constructor(message: string) {
    super();
    this.message = message;
  }
}
interface ClaimableAidrop {
  tokenAddress: string;
  airdrop: string;
  amount: string;
  userList: {
    address: string;
    amount: string;
  }[];
  status: 'UNCLAIMED' | 'CLAIMING' | 'CLAIMED';
}

interface CreatorClaimableAidrop {
  tokenAddress: string;
  airdrop: string;
  amount: string;
  status: 'UNCLAIMED' | 'CLAIMING' | 'CLAIMED';
  roundId: number;
}
export function UserPage() {
  const [searchToken, setSearchToken] = React.useState<string>('');
  const [isSearchingForAidrops, setIsSearchingForAidrops] =
    React.useState<boolean>(false);
  const [airdropSerachStatus, setAirdropSerachStatus] =
    React.useState<string>('');

  const [claimableAidrops, setClaimableAidrops] = React.useState<
    ClaimableAidrop[]
  >([]);
  const [creatorClaimableAidrops, setCreatorClaimableAidrops] = React.useState<
    CreatorClaimableAidrop[]
  >([]);

  const [tokenNames, setTokenNames] = React.useState<{ [p: string]: string }>(
    {},
  );

  const { address } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const [contractAddress, isSupportedNetwork] = useContractAddress();
  const nativeToken = '0x0000000000000000000000000000000000000000';

  const contract = useContract({
    addressOrName: contractAddress,
    contractInterface: contractABI,
    signerOrProvider: signer,
  });
  async function creatorClaim(index: number) {
    try {
      const airdrop = creatorClaimableAidrops[index];
      setCreatorClaimableAidrops(airdrops => {
        airdrops[index].status = 'CLAIMING';
        return [...airdrops];
      });
      const airdropContract = new ethers.Contract(
        airdrop.airdrop,
        merkleChildABI,
        signer!,
      );
      const transaction = await airdropContract.creatorClaim(airdrop.roundId);
      const response = await transaction.wait();
      setClaimableAidrops(airdrops => {
        airdrops[index].status = 'CLAIMED';
        return [...airdrops];
      });
    } catch (e: any) {
      setClaimableAidrops(airdrops => {
        airdrops[index].status = 'UNCLAIMED';
        return [...airdrops];
      });

      const code = e.code;
      if (code !== undefined && Object.keys(ErrorCode).includes(code)) {
        alert(e.reason ?? e.message);
      } else {
        alert('Some error occured! Check console for mor details.');
      }
      console.error(e);
    }
  }

  async function claimAirdrop(index: number) {
    try {
      const airdrop = claimableAidrops[index];
      setClaimableAidrops(airdrops => {
        airdrops[index].status = 'CLAIMING';
        return [...airdrops];
      });

      let decimals = 18;
      if (airdrop.tokenAddress !== NULL_ADDRESS) {
        const tokenContract = new ethers.Contract(
          airdrop.tokenAddress,
          erc20ABI,
          signer!,
        );
        decimals = await tokenContract.decimals();
      }
      const tree = createMerkleTree(
        airdrop.userList.map(x => createLeaf(x.address, x.amount, decimals)),
      );

      const proof = tree.getHexProof(
        createLeaf(address!, airdrop.amount, decimals),
      );
      const airdropContract = new ethers.Contract(
        airdrop.airdrop,
        merkleChildABI,
        signer!,
      );

      const claimFee = await contract.claimFee();
      const transaction = await airdropContract.claim(
        parseUnits(airdrop.amount, decimals),
        proof,
        {
          value: claimFee,
        },
      );
      const response = await transaction.wait();
      setClaimableAidrops(airdrops => {
        airdrops[index].status = 'CLAIMED';
        return [...airdrops];
      });
    } catch (e: any) {
      setClaimableAidrops(airdrops => {
        airdrops[index].status = 'UNCLAIMED';
        return [...airdrops];
      });

      const code = e.code;
      if (code !== undefined && Object.keys(ErrorCode).includes(code)) {
        alert(e.reason ?? e.message);
      } else {
        alert('Some error occured! Check console for mor details.');
      }
      console.error(e);
    }
  }

  async function fetchAirdropData(
    airdropId: string,
    tokenAddress: string,
    callback: VoidFunction,
  ) {
    const airdropUuid = await contract.airdropUserList(airdropId);
    const usersList = await axios
      .get(`${DOMAIN_NAME}airdrops`, {
        params: {
          url: 'airdrops/' + airdropUuid,
        },
      })
      .then(response => response.data)
      .catch(error => console.error(error));

    const airdropContract = new ethers.Contract(
      airdropId,
      merkleChildABI,
      signer!,
    );

    let decimals = BigNumber.from(18);
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer!);
    if (tokenAddress !== NULL_ADDRESS) {
      decimals = await tokenContract.decimals();
    }

    // User Claim
    const _userClaimableDrops: ClaimableAidrop[] = [];
    if (usersList != null) {
      usersList.forEach(async user => {
        if (address !== user.address) return;
        const canUserClaim = await airdropContract.userClaimStatus(address);
        if (canUserClaim) {
          _userClaimableDrops.push({
            tokenAddress: tokenAddress,
            airdrop: airdropId,
            amount: user.amount,
            userList: usersList,
            status: 'UNCLAIMED',
          });
        }
      });
    }
    // Creator Claim
    const creatorClaimStatus: boolean[] =
      await airdropContract.creatorClaimStatus();
    const roundId = creatorClaimStatus.indexOf(true);
    const _creatorClaimableDrops: CreatorClaimableAidrop[] = [];

    if (roundId >= 0) {
      let totalAmount: BigNumber = await airdropContract.nonClaimedFunds();
      if (totalAmount.isZero()) {
        if (tokenAddress === NULL_ADDRESS) {
          totalAmount = await provider.getBalance(airdropId);
        } else {
          totalAmount = await tokenContract.balanceOf(airdropId);
        }
      }
      const amount = totalAmount.div(4);
      _creatorClaimableDrops.push({
        tokenAddress: tokenAddress,
        airdrop: airdropId,
        amount: ethers.utils.formatUnits(amount, decimals),
        status: 'UNCLAIMED',
        roundId: roundId,
      });
    }

    setClaimableAidrops(drops => [...drops, ..._userClaimableDrops]);
    setCreatorClaimableAidrops(drops => [...drops, ..._creatorClaimableDrops]);

    callback();
  }
  const searchForAirdrops = async native => {
    try {
      if (address === undefined) return alert('Connect your wallet to use');
      let token = native === true ? nativeToken : searchToken.trim();
      if (token === '') return alert('Enter token');
      setClaimableAidrops([]);
      setCreatorClaimableAidrops([]);
      setIsSearchingForAidrops(true);
      setAirdropSerachStatus('Searching...');
      const aidropIds: string[] = await contract.getAllTokenAirdrops(token);
      if (aidropIds.length === 0) {
        throw new SimpleError('No airdrops found');
      }

      const tokenContract = new ethers.Contract(token, erc20ABI, signer!);
      if (token !== NULL_ADDRESS) {
        tokenContract.name().then((tokenName: string) => {
          setTokenNames(names => ({ ...names, [token]: tokenName }));
        });
      } else {
        setTokenNames(names => ({ ...names, [token]: 'NATIVE TOKENS' }));
      }

      let pendingAirdrops = [...aidropIds];
      setAirdropSerachStatus('Fetching details...');
      const airdropFetchComplete = (airdropId: string) => {
        pendingAirdrops = pendingAirdrops.filter(e => e !== airdropId);
        if (pendingAirdrops.length === 0) {
          setIsSearchingForAidrops(false);
        }
      };
      aidropIds.forEach(airdrop =>
        fetchAirdropData(airdrop, token, () => airdropFetchComplete(airdrop)),
      );
    } catch (e) {
      console.log(e);
      setIsSearchingForAidrops(false);
      setAirdropSerachStatus('');
      if (e instanceof SimpleError) {
        return alert(e.message);
      }
      return alert('Some error occured. Make sure the token address is valid');
    }
  };

  return (
    <>
      <Header />

      <AppWrapper address={address} isSupportedNetwork={isSupportedNetwork}>
        <div
          className="container"
          style={{
            bottom: 30,
            minHeight: 'calc(100vh - 130px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <a href="/app">Create Kitties</a>
            <a href="/user">[Collect Kitties]</a>
          </div>
          <br />
          <div className="panel">
            <h1>
              Welcome to ClaimKitty. <br />
              Let's see all Kitties claimable!
            </h1>
            <input
              className="form"
              type="text"
              name="searchAirdrop"
              placeholder="Insert Here Token Address to claim"
              value={searchToken}
              onChange={e => setSearchToken(e.target.value.trim())}
            />
            {!isSearchingForAidrops ? (
              <div
                className="button"
                id="claimAll"
                onClick={e => searchForAirdrops(false)}
              >
                Search Token
              </div>
            ) : (
              <>
                <div style={{ margin: '10px 0' }}>{airdropSerachStatus}</div>
              </>
            )}
            <button
              className="button"
              style={{
                display: 'block',
                marginTop: '10px',
                backgroundColor: '#EFA1D2',
                border: 'none',
                color: 'white',
                width: '100%',
                fontSize: '18px',
              }}
              onClick={e => searchForAirdrops(true)}
            >
              Search Native Kitties
            </button>
            {claimableAidrops.length > 0 && (
              <div className="claimList" style={{ marginTop: 20 }}>
                {claimableAidrops.map((drop, index) => (
                  <div className="claimPanel" key={'drop' + index}>
                    {tokenNames[drop.tokenAddress] ?? drop.tokenAddress} -{' '}
                    {drop.amount} <br />
                    <span style={{ fontSize: '11px', fontWeight: '100' }}>
                      {drop.tokenAddress}
                    </span>
                    {drop.status === 'UNCLAIMED' && (
                      <div
                        className="button"
                        id="claimButton"
                        style={{ marginTop: '10px' }}
                        onClick={() => {
                          claimAirdrop(index);
                        }}
                      >
                        Claim
                      </div>
                    )}
                    {drop.status === 'CLAIMING' && (
                      <span style={{ float: 'right' }}>CLAIMING...</span>
                    )}
                    {drop.status === 'CLAIMED' && (
                      <span style={{ float: 'right' }}>CLAIMED</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {creatorClaimableAidrops.length > 0 && (
            <div className="panel">
              <h1>Claim left Tokens from your own Kitties</h1>
              <p>
                {' '}
                <strong>Please Note:</strong> Your left tokens will be split
                into three tranches in order to avoid any dump of the Token.
                First tranche will be available starting from the next day of
                the Kitties end. The second one three months after and the third
                one after six months. You will have 2 weeks to claim your
                tokens. <br /> <strong>Example:</strong> If for example your
                Kitties ends in 31/12, in 01/01 you will be able to claim the
                first tranche of your tokens until 15/01. For the second tranche
                from 01/04 to 15/04 and the last one from 01/07 to 15/07.{' '}
              </p>
              <>
                <div className="claimList">
                  <p>
                    <b>Token Name - Amount</b>
                  </p>
                  {creatorClaimableAidrops.map((drop, index) => (
                    <div className="claimPanel" key={'drop-creator-' + index}>
                      {tokenNames[drop.tokenAddress] ?? drop.tokenAddress}
                      {' - '}
                      {drop.amount}
                      <br />
                      <span style={{ fontSize: '11px', fontWeight: '100' }}>
                        {drop.tokenAddress}
                      </span>
                      {drop.status === 'UNCLAIMED' && (
                        <div
                          className="button"
                          id="claimButton"
                          style={{ marginTop: '10px' }}
                          onClick={() => creatorClaim(index)}
                        >
                          Claim
                        </div>
                      )}
                      {drop.status === 'CLAIMING' && (
                        <span style={{ float: 'right' }}>CLAIMING...</span>
                      )}
                      {drop.status === 'CLAIMED' && (
                        <span style={{ float: 'right' }}>CLAIMED</span>
                      )}
                    </div>
                  ))}
                </div>
                <div
                  className="button"
                  id="claimAll"
                  onClick={() => {
                    creatorClaimableAidrops.forEach((drop, index) =>
                      creatorClaim(index),
                    );
                  }}
                >
                  Claim All
                </div>
              </>
            </div>
          )}
          <p>
            <br />
          </p>
          <Footer />
        </div>
      </AppWrapper>
    </>
  );
}
