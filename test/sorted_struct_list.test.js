
const { BN } = require('openzeppelin-test-helpers');
const { expect } = require('chai');

const HEAD = new BN(0);
const INVALID_TOKEN_ID = new BN(9999);

const SortedStructListMock = artifacts.require('SortedStructListMock.sol');

contract('SortedStructListMock', function (accounts) {
    const owner = accounts[0];
    const value = new BN(1);

    beforeEach(async function () {
        this.list = await SortedStructListMock.new({ from: owner });
    });

    context('when list is empty', function () {
        describe('sizeOf', function () {
            it('should be zero', async function () {
                expect(await this.list.sizeOf()).to.be.bignumber.equal(new BN(0));
            });
        });

        describe('getNode', function () {
            it('should not exists', async function () {
                const node = await this.list.getNode(1);
                expect(node[0]).to.be.equal(false);
                expect(node[1]).to.be.bignumber.equal(HEAD);
                expect(node[2]).to.be.bignumber.equal(HEAD);
            });
        });
    });

    context('when list is not empty (1 node)', function () {
        let aliceId;

        context('adding a node', function () {
            beforeEach(async function () {
                await this.list.newNode(value);
                aliceId = await this.list.id();
                await this.list.insert(aliceId);
            });

            describe('sizeOf', function () {
                it('should be greater than zero', async function () {
                    expect(await this.list.sizeOf()).to.be.bignumber.equal(new BN(1));
                });
            });

            describe('exists', function () {
                it('should be true', async function () {
                    expect(await this.list.exists(aliceId)).to.be.equal(true);
                });
            });

            describe('getNode', function () {
                it('LEFT and RIGHT should be HEAD', async function () {
                    const node = await this.list.getNode(aliceId);
                    expect(node[0]).to.be.equal(true);
                    expect(node[1]).to.be.bignumber.equal(HEAD);
                    expect(node[2]).to.be.bignumber.equal(HEAD);
                });
            });

            describe('getNextNode of not existent node', function () {
                it('should be false', async function () {
                    const node = await this.list.getNextNode(INVALID_TOKEN_ID);
                    expect(node[0]).to.be.equal(false);
                    expect(node[1]).to.be.bignumber.equal(HEAD);
                });
            });

            describe('remove not existent node', function () {
                it('should fail', async function () {
                    const error = 0;
                    const result = await this.list.remove(INVALID_TOKEN_ID);
                    expect(new BN(result.logs.length)).to.be.bignumber.equal(new BN(error));
                });
            });

            describe('remove the HEAD node', function () {
                it('should fail', async function () {
                    const error = 0;
                    const result = await this.list.remove(HEAD);
                    expect(new BN(result.logs.length)).to.be.bignumber.equal(new BN(error));
                });
            });
        });
        context('adding more nodes', function () {
            let bobId;
            let charlyId;

            beforeEach(async function () {
                await this.list.newNode(new BN(1));
                aliceId = await this.list.id();
                await this.list.insert(aliceId);

                await this.list.newNode(new BN(4));
                bobId = await this.list.id();

                await this.list.newNode(new BN(2));
                charlyId = await this.list.id();
            });

            describe('adding nodes (3 times)', function () {
                let aliceNode;
                let bobNode;
                let charlyNode;

                beforeEach(async function () {
                    await this.list.insert(bobId);
                    await this.list.insert(charlyId);

                    aliceNode = await this.list.getNode(aliceId);
                    bobNode = await this.list.getNode(bobId);
                    charlyNode = await this.list.getNode(charlyId);
                });

                it('aliceNode LEFT should be init', async function () {
                    const init = new BN(0);
                    expect(aliceNode[1]).to.be.bignumber.equal(init);
                });

                it('aliceNode RIGHT should be charlyNode', async function () {
                    expect(aliceNode[2]).to.be.bignumber.equal(charlyId);
                });

                it('charlyNode LEFT should be aliceNode', async function () {
                    expect(charlyNode[1]).to.be.bignumber.equal(aliceId);
                });

                it('charlyNode RIGHT should be bobId', async function () {
                    expect(charlyNode[2]).to.be.bignumber.equal(bobId);
                });

                it('bobNode LEFT should be aliceNode', async function () {
                    expect(bobNode[1]).to.be.bignumber.equal(charlyId);
                });

                it('bobNode RIGHT should be HEAD', async function () {
                    expect(bobNode[2]).to.be.bignumber.equal(HEAD);
                });

                it('should insert in the beginning', async function () {
                    await this.list.newNode(new BN(0));
                    const deanId = await this.list.id();
                    await this.list.insert(deanId);
                    const deanNode = await this.list.getNode(deanId);
                    expect(deanNode[1]).to.be.bignumber.equal(new BN(0));
                    expect(deanNode[2]).to.be.bignumber.equal(aliceId);
                });

                it('should insert on the middle', async function () {
                    await this.list.newNode(new BN(3));
                    const deanId = await this.list.id();
                    await this.list.insert(deanId);
                    const deanNode = await this.list.getNode(deanId);
                    expect(deanNode[1]).to.be.bignumber.equal(charlyId);
                    expect(deanNode[2]).to.be.bignumber.equal(bobId);
                });

                it('should insert in the end', async function () {
                    await this.list.newNode(new BN(10));
                    const deanId = await this.list.id();
                    await this.list.insert(deanId);
                    const deanNode = await this.list.getNode(deanId);
                    expect(deanNode[1]).to.be.bignumber.equal(bobId);
                    expect(deanNode[2]).to.be.bignumber.equal(new BN(0));
                });
                context('testing remove', function () {
                    describe('remove aliceNode', function () {
                        beforeEach(async function () {
                            await this.list.remove(aliceId);
                            bobNode = await this.list.getNode(bobId);
                            charlyNode = await this.list.getNode(charlyId);
                        });

                        it('aliceNode should no longer exists', async function () {
                            aliceNode = await this.list.getNode(aliceId);
                            expect(aliceNode[0]).to.be.equal(false);
                            expect(aliceNode[1]).to.be.bignumber.equal(HEAD);
                            expect(aliceNode[2]).to.be.bignumber.equal(HEAD);
                        });

                        it('bobNode LEFT should be charlyNode', async function () {
                            expect(bobNode[1]).to.be.bignumber.equal(charlyId);
                        });

                        it('bobNode RIGHT should be HEAD', async function () {
                            expect(bobNode[2]).to.be.bignumber.equal(HEAD);
                        });

                        it('charlyNode LEFT should be HEAD', async function () {
                            expect(charlyNode[1]).to.be.bignumber.equal(HEAD);
                        });

                        it('charlyNode RIGHT should be bobNode', async function () {
                            expect(charlyNode[2]).to.be.bignumber.equal(bobId);
                        });
                    });

                    describe('remove bobNode', function () {
                        beforeEach(async function () {
                            await this.list.remove(bobId);
                            aliceNode = await this.list.getNode(aliceId);
                            charlyNode = await this.list.getNode(charlyId);
                        });

                        it('bobNode should no longer exists', async function () {
                            bobNode = await this.list.getNode(bobId);
                            expect(bobNode[0]).to.be.equal(false);
                            expect(bobNode[1]).to.be.bignumber.equal(HEAD);
                            expect(bobNode[2]).to.be.bignumber.equal(HEAD);
                        });

                        it('aliceNode LEFT should be charlyNode', async function () {
                            const init = new BN(0);
                            expect(aliceNode[1]).to.be.bignumber.equal(init);
                        });

                        it('aliceNode RIGHT should be HEAD', async function () {
                            expect(aliceNode[2]).to.be.bignumber.equal(charlyId);
                        });

                        it('charlyNode LEFT should be HEAD', async function () {
                            expect(charlyNode[1]).to.be.bignumber.equal(aliceId);
                        });

                        it('charlyNode RIGHT should be aliceNode', async function () {
                            expect(charlyNode[2]).to.be.bignumber.equal(HEAD);
                        });
                    });

                    describe('remove charlyNode', function () {
                        beforeEach(async function () {
                            await this.list.remove(charlyId);
                            aliceNode = await this.list.getNode(aliceId);
                            bobNode = await this.list.getNode(bobId);
                        });

                        it('charlyNode should no longer exists', async function () {
                            charlyNode = await this.list.getNode(charlyId);
                            expect(charlyNode[0]).to.be.equal(false);
                            expect(charlyNode[1]).to.be.bignumber.equal(HEAD);
                            expect(charlyNode[2]).to.be.bignumber.equal(HEAD);
                        });

                        it('aliceNode LEFT should be HEAD', async function () {
                            expect(aliceNode[1]).to.be.bignumber.equal(HEAD);
                        });

                        it('aliceNode RIGHT should be bobNode', async function () {
                            expect(aliceNode[2]).to.be.bignumber.equal(bobId);
                        });

                        it('bobNode LEFT should be aliceNode', async function () {
                            expect(bobNode[1]).to.be.bignumber.equal(aliceId);
                        });

                        it('bobNode RIGHT should be HEAD', async function () {
                            expect(bobNode[2]).to.be.bignumber.equal(HEAD);
                        });
                    });
                });
            });
        });
    });
});
