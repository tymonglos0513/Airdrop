"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const keccak256_1 = __importDefault(require("keccak256"));
const merkletreejs_1 = require("merkletreejs");
const list1 = require('./list1')
const list2 = require('./list2')
console.log(list1.length)
const cors = require('cors');
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3003;
let addresses1nft1 = list1;
let addresses2nft1 = list2;
let addresses1nft2 = list1;
let addresses2nft2 = list2;
let addresses1nft3 = list1;
let addresses2nft3 = list2;

const merkleTree1nft1 = new merkletreejs_1.MerkleTree(addresses1nft1, keccak256_1.default, { hashLeaves: true, sortPairs: true });
const merkleTree2nft1 = new merkletreejs_1.MerkleTree(addresses2nft1, keccak256_1.default, { hashLeaves: true, sortPairs: true });

const merkleTree1nft2 = new merkletreejs_1.MerkleTree(addresses1nft2, keccak256_1.default, { hashLeaves: true, sortPairs: true });
const merkleTree2nft2 = new merkletreejs_1.MerkleTree(addresses2nft2, keccak256_1.default, { hashLeaves: true, sortPairs: true });

const merkleTree1nft3 = new merkletreejs_1.MerkleTree(addresses1nft3, keccak256_1.default, { hashLeaves: true, sortPairs: true });
const merkleTree2nft3 = new merkletreejs_1.MerkleTree(addresses2nft3, keccak256_1.default, { hashLeaves: true, sortPairs: true });

app.use(cors({
    //origin: 'https:website.com'
    origin: '*'
}));
app.use(express_1.default.static('public'));
console.log("root1", merkleTree1nft1.getRoot().toString('hex'));
console.log("root2", merkleTree2nft1.getRoot().toString('hex'));
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
app.get('/get_proof_by_address/:list/:nft/:address', (req, res) => {
    let address = req.params.address;
    let list = req.params.list;
    let nft = req.params.nft;
    let proof;
    if (list === "1") {
        if (nft == "1"){
            proof = merkleTree1nft1.getHexProof((0, keccak256_1.default)(address));
        } else if (nft == "2"){
            proof = merkleTree1nft2.getHexProof((0, keccak256_1.default)(address));
        } else if (nft == "3"){
            proof = merkleTree1nft3.getHexProof((0, keccak256_1.default)(address));
        } else {
            proof = [];
        }
    }
    else if (list === "2") {
        if (nft == "1"){
            proof = merkleTree2nft1.getHexProof((0, keccak256_1.default)(address));
        } else if (nft == "2"){
            proof = merkleTree2nft2.getHexProof((0, keccak256_1.default)(address));
        } else if (nft == "3"){
            proof = merkleTree2nft3.getHexProof((0, keccak256_1.default)(address));
        } else {
            proof = [];
        }
    }
    else {
        proof = [];
    }
    res.send(proof);
});
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
module.exports = app;
