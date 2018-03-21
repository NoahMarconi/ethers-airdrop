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

        it('should throw if C not a power of 2', function() {
            assert.throw(function() { AirDrop.merkleTools.chunckMerkleTree(exArray, 3) });
            assert.doesNotThrow(function() { AirDrop.merkleTools.chunkMerkleTree(exArray, 8) });
        });

        it('should chunk into expected number of leafs and roots', function() {
            var result_0 = {};
            var result_1 = {};
            var result_2 = {};
            var result_3 = {};
            // Init an array ranging from 0..15
            exArray = Array.apply(null, { length: 16 })
                .map(Number.call, Number)
                .map(function(x) { return ethers.utils.keccak256('0x' + x); });

            // > exArray
            // [ '0xbc36789e7a1e281436464229828f817d6612f7b477d66591ff96a9e064bcc98a',
            // '0x5fe7f977e71dba2ea1a68e21057beebb9be2ac30c6410aa38d4f3fbe41dcffd2',
            // '0xf2ee15ea639b73fa3db9b34a245bdfa015c260c598b211bf05a1ecc4b3e3b4f2',
            // '0x69c322e3248a5dfc29d73c5b0553b0185a35cd5bb6386747517ef7e53b15e287',
            // '0xf343681465b9efe82c933c3e8748c70cb8aa06539c361de20f72eac04e766393',
            // '0xdbb8d0f4c497851a5043c6363657698cb1387682cac2f786c731f8936109d795',
            // '0xd0591206d9e81e07f4defc5327957173572bcd1bca7838caa7be39b0c12b1873',
            // '0xee2a4bc7db81da2b7164e56b3649b1e2a09c58c455b15dabddd9146c7582cebc',
            // '0xd33e25809fcaa2b6900567812852539da8559dc8b76a7ce3fc5ddd77e8d19a69',
            // '0xb2e7b7a21d986ae84d62a7de4a916f006c4e42a596358b93bad65492d174c4ff',
            // '0x967f2a2c7f3d22f9278175c1e6aa39cf9171db91dceacd5ee0f37c2e507b5abe',
            // '0x0552ab8dc52e1cf9328ddb97e0966b9c88de9cca97f48b0110d7800982596158',
            // '0x5fa2358263196dbbf23d1ca7a509451f7a2f64c15837bfbb81298b1e3e24e4fa',
            // '0x62af204a12d42fdc0d1452abd76e3d611b00a98ccdab368ef149b27224b2f281',
            // '0x582aa85ad52d10699a52e42fb154675f38bd5e4b5224dbdd590343a196f2f017',
            // '0xe9c02e93247690ef932c18262eaa6fdb12bbcf7d5d6bcbf6b58a9ed80b5f211d' ]

            result_0 = AirDrop.merkleTools.chunkMerkleTree(exArray, 2);
            result_1 = AirDrop.merkleTools.chunkMerkleTree(exArray, 4);
            result_2 = AirDrop.merkleTools.chunkMerkleTree(exArray, 8);
            result_3 = AirDrop.merkleTools.chunkMerkleTree(exArray, 16);

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
});