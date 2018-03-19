var assert = require('chai').assert;
var ethers = require('ethers');
var AirDrop = require('..');


describe('Chunking Merkle', function() {
    describe('reduceMerkleParents()', function() {
        var exArray;

        before(function() {
            exArray = [1, 2, 3, 4, 5, 6].map(function(x) { return ethers.utils.keccak256('0x' + x); });
        });

        it('should reduce array of leaf nodes to thier parent', function() {
            var parentHashes = [
                ethers.utils.keccak256(exArray[0] + exArray[1].substring(2)),
                ethers.utils.keccak256(exArray[2] + exArray[3].substring(2)),
                ethers.utils.keccak256(exArray[4] + exArray[5].substring(2))
            ];
            assert.deepEqual(parentHashes, AirDrop.merkleTools.reduceMerkleParents(exArray));
        });
    });
});