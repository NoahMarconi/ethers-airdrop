var assert = require('chai').assert;
var ethers = require('ethers');
var AirDrop = require('..');


describe('Chunking Merkle', function() {
    var exArray;

    before(function() {
        exArray = [1, 2, 3, 4, 5, 6].map(function(x) { return ethers.utils.keccak256('0x' + x); });
    });

    describe('reduceMerkleParents()', function() {

        it('should reduce array of leaf nodes to thier parent', function() {
            var parentHashes = [
                ethers.utils.keccak256(exArray[0] + exArray[1].substring(2)),
                ethers.utils.keccak256(exArray[2] + exArray[3].substring(2)),
                ethers.utils.keccak256(exArray[4] + exArray[5].substring(2))
            ];

            assert.deepEqual(parentHashes, AirDrop.merkleTools.reduceMerkleParents(exArray));
        });

        it('should hash single leaf nodes with self', function() {
            var parentHashes = [
                ethers.utils.keccak256(exArray[0] + exArray[1].substring(2)),
                ethers.utils.keccak256(exArray[2] + exArray[3].substring(2)),
                // Final element hashed with self.
                ethers.utils.keccak256(exArray[4] + exArray[4].substring(2))
            ];

            // Slice to produce odd length array.
            assert.deepEqual(parentHashes, AirDrop.merkleTools.reduceMerkleParents(exArray.slice(0, 5)));
        });

        it('should has array of 2 into merkle root', function() {
            assert.deepEqual([ethers.utils.keccak256(exArray[0] + exArray[1].substring(2))], AirDrop.merkleTools.reduceMerkleParents(exArray.slice(0, 2)));
        });
    });

    describe('reduceMerkleRoot()', function() {

        it('should reduce array of leaf nodes to thier root hash', function() {
            var parentHashes = [
                ethers.utils.keccak256(exArray[0] + exArray[1].substring(2)),
                ethers.utils.keccak256(exArray[2] + exArray[3].substring(2)),
                ethers.utils.keccak256(exArray[4] + exArray[5].substring(2))
            ];

            var grandParentHashes = [
                ethers.utils.keccak256(parentHashes[0] + parentHashes[1].substring(2)),
                ethers.utils.keccak256(parentHashes[2] + parentHashes[2].substring(2))
            ];

            var rootHash = ethers.utils.keccak256(grandParentHashes[0] + grandParentHashes[1].substring(2));

            assert.deepEqual(rootHash, AirDrop.merkleTools.reduceMerkleRoot(exArray));
        });
    });

    describe('chunkMerkleTree()', function() {
        var idx = 10;
        var merkleRoot = '';
        var exArray = [];
        var proof_0 = [];
        var mNodes = [];
        var nNodes = [];
        var oNodes = [];

        var result_0 = {};
        var result_1 = {};
        var result_2 = {};
        var result_3 = {};

        before(function() {

            exArray = Array.apply(null, { length: 16 })
                .map(Number.call, Number)
                .map(function(x) { return ethers.utils.keccak256('0x' + x); });
        
            result_0 = AirDrop.merkleTools.chunkMerkleTree(exArray, 2);
            result_1 = AirDrop.merkleTools.chunkMerkleTree(exArray, 4);
            result_2 = AirDrop.merkleTools.chunkMerkleTree(exArray, 8);
            result_3 = AirDrop.merkleTools.chunkMerkleTree(exArray, 16);

            mNodes = [
                ethers.utils.keccak256(exArray[0] + exArray[1].substring(2)),
                ethers.utils.keccak256(exArray[2] + exArray[3].substring(2)),
                ethers.utils.keccak256(exArray[4] + exArray[5].substring(2)),
                ethers.utils.keccak256(exArray[6] + exArray[7].substring(2)),
                ethers.utils.keccak256(exArray[8] + exArray[9].substring(2)),
                ethers.utils.keccak256(exArray[10] + exArray[11].substring(2)),
                ethers.utils.keccak256(exArray[12] + exArray[13].substring(2)),
                ethers.utils.keccak256(exArray[14] + exArray[15].substring(2))
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

        it('should throw if C not a power of 2', function() {
            assert.throw(function() { AirDrop.merkleTools.chunckMerkleTree(exArray, 3) });
            assert.doesNotThrow(function() { AirDrop.merkleTools.chunkMerkleTree(exArray, 8) });
        });

        it('should chunk into expected number of leafs and roots', function() {

            // Chunks are expected size.
            assert.strictEqual(result_0.chunks.length, 8);
            assert.strictEqual(result_1.chunks.length, 4);
            assert.strictEqual(result_2.chunks.length, 2);
            assert.strictEqual(result_3.chunks.length, 1);

            // Roots are expected size.
            assert.strictEqual(result_0.root.length, 8);
            assert.strictEqual(result_1.root.length, 4);
            assert.strictEqual(result_2.root.length, 2);
            assert.strictEqual(result_3.root.length, 1);

        });

        it('should chunk into correct root hashes', function() {

            assert.deepEqual(result_0.root, mNodes);
            assert.deepEqual(result_1.root, nNodes);
            assert.deepEqual(result_2.root, oNodes);
            assert.equal(result_3.root[0], merkleRoot);
        });
    });

    describe('chunkMerkleProof()', function() {

        var result_0 = {};
        var result_1 = {};
        var result_2 = {};
        var result_3 = {};

        before(function() {

            exArray = Array.apply(null, { length: 16 })
                .map(Number.call, Number)
                .map(function(x) { return ethers.utils.keccak256('0x' + x); });
        
            result_0 = AirDrop.merkleTools.chunkMerkleTree(exArray, 2);
            result_1 = AirDrop.merkleTools.chunkMerkleTree(exArray, 4);
            result_2 = AirDrop.merkleTools.chunkMerkleTree(exArray, 8);
            result_3 = AirDrop.merkleTools.chunkMerkleTree(exArray, 16);
        
        });

        it('should produce the same merkle proof from any chunkSize', function() {
            var idx = 10;
            var proof_0 = AirDrop.merkleTools.chunkMerkleProof(idx, result_0.chunks[Math.floor(idx/2)], result_0.root);
            var proof_1 = AirDrop.merkleTools.chunkMerkleProof(idx, result_1.chunks[Math.floor(idx/4)], result_1.root);
            var proof_2 = AirDrop.merkleTools.chunkMerkleProof(idx, result_2.chunks[Math.floor(idx/8)], result_2.root);
            var proof_3 = AirDrop.merkleTools.chunkMerkleProof(idx, result_3.chunks[Math.floor(idx/16)], result_3.root);
                     
            assert.deepEqual(proof_0, proof_1);
            assert.deepEqual(proof_0, proof_2);
            assert.deepEqual(proof_0, proof_3);
        });
    });

    describe('checkMerkleProof()', function() {
        var result_0 = {};
        var idx = 10;
        var merkleRoot = '';
        var proof_0 = [];
        var mNodes = [];
        var nNodes = [];
        var oNodes = [];

        before(function() {

            exArray = Array.apply(null, { length: 16 })
                .map(Number.call, Number)
                .map(function(x) { return ethers.utils.keccak256('0x' + x); });
        
            result_0 = AirDrop.merkleTools.chunkMerkleTree(exArray, 2);
            
            proof_0 = AirDrop.merkleTools.chunkMerkleProof(idx, result_0.chunks[Math.floor(idx/2)], result_0.root);

            mNodes = [
                ethers.utils.keccak256(exArray[0] + exArray[1].substring(2)),
                ethers.utils.keccak256(exArray[2] + exArray[3].substring(2)),
                ethers.utils.keccak256(exArray[4] + exArray[5].substring(2)),
                ethers.utils.keccak256(exArray[6] + exArray[7].substring(2)),
                ethers.utils.keccak256(exArray[8] + exArray[9].substring(2)),
                ethers.utils.keccak256(exArray[10] + exArray[11].substring(2)),
                ethers.utils.keccak256(exArray[12] + exArray[13].substring(2)),
                ethers.utils.keccak256(exArray[14] + exArray[15].substring(2))
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

        it('should verify the proof matches the merkle root', function() {

            assert.isTrue(AirDrop.merkleTools.checkMerkleProof(
                idx,
                exArray[idx],
                proof_0,
                merkleRoot
            ));
        });
    });
});