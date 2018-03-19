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
    });

    describe('reduceMerkleRoot', function() {

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

    describe('chunckMerkleTree', function() {

        it('should throw if C not a power of 2', function() {
            assert.throw(function() { AirDrop.merkleTools.chunckMerkleTree(exArray, 3) });
            assert.doesNotThrow(function() { AirDrop.merkleTools.chunckMerkleTree(exArray, 8) });
        });
    });
});