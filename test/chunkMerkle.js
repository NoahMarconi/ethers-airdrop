var assert = require('chai').assert;
var ethers = require('ethers');
var AirDrop = require('..');


describe('Chunking Merkle', function() {
    var exArray;
    var exBalances;
    var exLeaves;
    var hashedLeaves;
    var merkleRoot = '';
    var mNodes = [];
    var nNodes = [];
    var oNodes = [];


    before(function() {
        exArray = Array.apply(null, { length: 16 })
            .map(Number.call, Number);

        exBalances = exArray.reduce(function(acc, el) {
            // Match airdrop-balances.json format with a random address for key and a hex string for value.
            acc[ethers.Wallet.createRandom().address] = ethers.utils.bigNumberify(el + 1).toHexString();
            return acc;
        }, {});

        exLeaves = AirDrop.merkleTools.expandLeaves(exBalances);
        hashedLeaves = AirDrop.merkleTools.getLeaves(exBalances);


        mNodes = [
            ethers.utils.keccak256(hashedLeaves[0] + hashedLeaves[1].substring(2)),
            ethers.utils.keccak256(hashedLeaves[2] + hashedLeaves[3].substring(2)),
            ethers.utils.keccak256(hashedLeaves[4] + hashedLeaves[5].substring(2)),
            ethers.utils.keccak256(hashedLeaves[6] + hashedLeaves[7].substring(2)),
            ethers.utils.keccak256(hashedLeaves[8] + hashedLeaves[9].substring(2)),
            ethers.utils.keccak256(hashedLeaves[10] + hashedLeaves[11].substring(2)),
            ethers.utils.keccak256(hashedLeaves[12] + hashedLeaves[13].substring(2)),
            ethers.utils.keccak256(hashedLeaves[14] + hashedLeaves[15].substring(2))
        ];

        nNodes = [
            ethers.utils.keccak256(mNodes[0] + mNodes[1].substring(2)),
            ethers.utils.keccak256(mNodes[2] + mNodes[3].substring(2)),
            ethers.utils.keccak256(mNodes[4] + mNodes[5].substring(2)),
            ethers.utils.keccak256(mNodes[6] + mNodes[7].substring(2)),
        ];

        oNodes = [
            ethers.utils.keccak256(nNodes[0] + nNodes[1].substring(2)),
            ethers.utils.keccak256(nNodes[2] + nNodes[3].substring(2))
        ]

        merkleRoot = ethers.utils.keccak256(oNodes[0] + oNodes[1].substring(2));
    });

    describe('reduceMerkleParents()', function() {
        var smallArray = [];

        before(function() {
           smallArray = [1, 2, 3, 4, 5, 6].map(function(x) { return ethers.utils.keccak256('0x' + x); });
        });

        it('should reduce array of leaf nodes to thier parent', function() {
            var parentHashes = [
                ethers.utils.keccak256(smallArray[0] + smallArray[1].substring(2)),
                ethers.utils.keccak256(smallArray[2] + smallArray[3].substring(2)),
                ethers.utils.keccak256(smallArray[4] + smallArray[5].substring(2))
            ];

            assert.deepEqual(parentHashes, AirDrop.merkleTools.reduceMerkleParents(smallArray));
        });

        it('should hash single leaf nodes with self', function() {
            var parentHashes = [
                ethers.utils.keccak256(smallArray[0] + smallArray[1].substring(2)),
                ethers.utils.keccak256(smallArray[2] + smallArray[3].substring(2)),
                // Final element hashed with self.
                ethers.utils.keccak256(smallArray[4] + smallArray[4].substring(2))
            ];

            // Slice to produce odd length array.
            assert.deepEqual(parentHashes, AirDrop.merkleTools.reduceMerkleParents(smallArray.slice(0, 5)));
        });

        it('should has array of 2 into merkle root', function() {
            assert.deepEqual([ethers.utils.keccak256(smallArray[0] + smallArray[1].substring(2))], AirDrop.merkleTools.reduceMerkleParents(smallArray.slice(0, 2)));
        });
    });

    describe('reduceMerkleRoot()', function() {
        var smallArray = [];

        before(function() {
            smallArray = [1, 2, 3, 4, 5, 6].map(function(x) { return ethers.utils.keccak256('0x' + x); });
         });

        it('should reduce array of leaf nodes to thier root hash', function() {
            var parentHashes = [
                ethers.utils.keccak256(smallArray[0] + smallArray[1].substring(2)),
                ethers.utils.keccak256(smallArray[2] + smallArray[3].substring(2)),
                ethers.utils.keccak256(smallArray[4] + smallArray[5].substring(2))
            ];

            var grandParentHashes = [
                ethers.utils.keccak256(parentHashes[0] + parentHashes[1].substring(2)),
                ethers.utils.keccak256(parentHashes[2] + parentHashes[2].substring(2))
            ];

            var rootHash = ethers.utils.keccak256(grandParentHashes[0] + grandParentHashes[1].substring(2));

            assert.deepEqual(rootHash, AirDrop.merkleTools.reduceMerkleRoot(smallArray));
        });
    });

    describe('chunkMerkleTree()', function() {
        var idx = 10;
        var proof_0 = [];

        var result_0 = {};
        var result_1 = {};
        var result_2 = {};
        var result_3 = {};

        before(function() {
        
            result_0 = AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 2);
            result_1 = AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 4);
            result_2 = AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 8);
            result_3 = AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 16);
        
        });

        it('should throw if C not a power of 2', function() {
            assert.throw(function() { AirDrop.merkleTools.chunckMerkleTree(hashedLeaves, 3) });
            assert.doesNotThrow(function() { AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 8) });
        });

        it('should chunk into expected number of leafs and roots', function() {

            // Chunks are expected size.
            assert.strictEqual(result_0.chunks.length, 8);
            assert.strictEqual(result_1.chunks.length, 4);
            assert.strictEqual(result_2.chunks.length, 2);
            assert.strictEqual(result_3.chunks.length, 1);

            // Roots are expected size.
            assert.strictEqual(result_0.root.roots.length, 8);
            assert.strictEqual(result_1.root.roots.length, 4);
            assert.strictEqual(result_2.root.roots.length, 2);
            assert.strictEqual(result_3.root.roots.length, 1);

        });

        it('should chunk into correct root hashes', function() {

            assert.deepEqual(result_0.root.roots, mNodes);
            assert.deepEqual(result_1.root.roots, nNodes);
            assert.deepEqual(result_2.root.roots, oNodes);
            assert.equal(result_3.root.roots[0], merkleRoot);
        });
    });

    describe('chunkMerkleProof()', function() {

        var result_0 = {};
        var result_1 = {};
        var result_2 = {};
        var result_3 = {};

        before(function() {
        
            result_0 = AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 2);
            result_1 = AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 4);
            result_2 = AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 8);
            result_3 = AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 16);        
        });

        it('should produce the same merkle proof from any chunkSize', function() {
            var idx = 10;
            var proof_0 = AirDrop.merkleTools.chunkMerkleProof(idx, result_0.chunks[Math.floor(idx/2)], result_0.root.roots);
            var proof_1 = AirDrop.merkleTools.chunkMerkleProof(idx, result_1.chunks[Math.floor(idx/4)], result_1.root.roots);
            var proof_2 = AirDrop.merkleTools.chunkMerkleProof(idx, result_2.chunks[Math.floor(idx/8)], result_2.root.roots);
            var proof_3 = AirDrop.merkleTools.chunkMerkleProof(idx, result_3.chunks[Math.floor(idx/16)], result_3.root.roots);
                     
            assert.deepEqual(proof_0, proof_1);
            assert.deepEqual(proof_0, proof_2);
            assert.deepEqual(proof_0, proof_3);
        });
    });

    describe('checkMerkleProof()', function() {
        var result_0 = {};
        var idx = 10;
        var proof_0 = [];

        before(function() {
            result_0 = AirDrop.merkleTools.chunkMerkleTree(hashedLeaves, 2);
            proof_0 = AirDrop.merkleTools.chunkMerkleProof(idx, result_0.chunks[Math.floor(idx/2)], result_0.root.roots);
        });

        it('should verify the proof matches the merkle root', function() {

            assert.isTrue(AirDrop.merkleTools.checkMerkleProof(
                idx,
                hashedLeaves[idx],
                proof_0,
                merkleRoot
            ));
        });
    });
});