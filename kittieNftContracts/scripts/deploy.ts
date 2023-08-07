const colors = require('colors');
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat'
import keccak256 from 'keccak256'
import { MerkleTree } from 'merkletreejs'
const test_util = require('./util');
const fs = require('fs');
const lineByLine = require('n-readlines');

import { KittieNft } from '../typechain'

async function main() {
    const [signer] = await ethers.getSigners()
    if (signer === undefined) throw new Error('Deployer is undefined.')
    console.log(colors.cyan('Deployer Address: ') + colors.yellow(signer.address));
    console.log();
    console.log(colors.yellow('Deploying...'));
    console.log();

    let addresses: string[] = []
    let proofs: any[] = []
    let rowCounter = 0;

    let kittieNft: KittieNft;



    const liner = new lineByLine('addr-list.txt');

    let line;

    while (line = liner.next()) {
        addresses.push(line.toString())
        rowCounter++;
        console.log({
            rowCounter
        })
    }
    console.log({
        addresses
    })

    const merkleTree = new MerkleTree(
        addresses,
        keccak256,
        { hashLeaves: true, sortPairs: true }
    )

    for (let i = 0; i < addresses.length; i++) {
        const add = addresses[i];
        const proof = merkleTree.getHexProof(keccak256(add!));
        proofs.push({
            address: addresses[i],
            proof
        });
        console.log({
            i
        });
    }


    const root = merkleTree.getHexRoot()
    let rootData = JSON.stringify(root);
    fs.writeFileSync('root.json', rootData);


    let proofsData = JSON.stringify(proofs);
    fs.writeFileSync('proofs.json', proofsData);

    /// ---------------------------------------------
    // 1 QmWTMsiqKMse3u3n2QdrBw64GZ3rRNpFQFR61PAH1Qwwro
    // 2 QmaNc4NeeADXBmmFrBWRMVpLGrE3mdZFKhvVCSVRS4tdkH
    // 3 QmPCyHdssc5mzhbyCz9DmLN6cAEdnVT9zQh7qua8iHaiDt

    let contractName = "KittieNft"
    console.log(colors.yellow('Deploying ') + colors.cyan(contractName) + colors.yellow('...'));

    const contractFactory = await ethers.getContractFactory(contractName);
    kittieNft = await contractFactory.deploy(
        3,
        30,
        parseEther("0.005"), // _cost
        30000, // _maxSupply
        "KittieNft3", // _name
        "KTNFT3", // _symbol
        "https://gateway.pinata.cloud/ipfs/QmPCyHdssc5mzhbyCz9DmLN6cAEdnVT9zQh7qua8iHaiDt", // _initBaseURI
    ) as KittieNft;
    await kittieNft.deployed()
    console.log(colors.cyan('Contract Address: ') + colors.yellow(kittieNft.address));
//     console.log(colors.yellow('verifying...'));
//     await test_util.sleep(60);
//     await test_util.updateABI(contractName)
//     await test_util.verify(kittieNft.address, contractName, [1, 100, parseEther("0.03"), 10000, "KittieNft1", "KTNFT1", "https://api.kitties.com/kitties/"])
}

main()
    .then(async () => {
        console.log("Done")
    })
    .catch(error => {
        console.error(error);
        return undefined;
    })