const { expect } = require("chai");
const { ethers } = require('hardhat');

describe.skip('BLXBank', function (){
    beforeEach(async function(){
        [owner, wallet1, wallet2] = await ethers.getSigners();

        BLXBank = await ethers.getContractFactory('BLXBank', owner);
        BLXToken = await ethers.getContractFactory('BLXToken', wallet1);
        blxbank = await BLXBank.deploy();
        blxtoken = await BLXToken.deploy();
        
        blxtoken.connect(wallet1).transfer(wallet2.address, 1000);

        await blxtoken.connect(wallet1).approve(
            blxbank.address,
            4000
        );
        await blxtoken.connect(wallet2).approve(
            blxbank.address,
            1000
        );

        BLX = ethers.utils.formatBytes32String('BLX');
        await blxbank.whitelistToken(
            BLX,
            blxtoken.address
        );

        await blxbank.connect(wallet1).activateBankAccount();


        await blxbank.connect(wallet2).activateBankAccount();
    });

describe('deployment', function() {
    it('should mint tokens to wallet 1', async function () {
        expect(await blxtoken.balanceOf(wallet1.address)).to.equal(4000);
    })
    it('should transfer tokens to wallet 2', async function () {
        expect(await blxtoken.balanceOf(wallet2.address)).to.equal(1000);
    })    
    it('should whitelist BLXtokens on the contract', async function () {
        expect(
            await blxbank.whitelistedTokens(BLX)
        ).to.equal(blxtoken.address);
    })      
})

describe('depositTokens', function () {
    it('should deposit BLXtokens', async function () {
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            100,
        );
        await blxbank.connect(wallet2).depositTokens(
            BLX,
            50,
        );

        expect(await blxtoken.balanceOf(wallet1.address)).to.equal(3900);
        expect(await blxtoken.balanceOf(wallet2.address)).to.equal(950);   
        account1 = await blxbank.addressToBankAccount(wallet1.address);
        account2 = await blxbank.addressToBankAccount(wallet2.address);

        expect(account1[1]).to.equal(100);
        expect(account2[1]).to.equal(50);     
        expect(account2[4]).to.equal(1);  
        expect(account2[4]).to.equal(1); 
        
    })

    it('should not allow deposit to inactive account', async function(){
        await blxbank.connect(wallet1).deactivateBankAccount();
        await expect(blxbank.connect(wallet1).depositTokens(
            BLX,
            600,
        )).to.be.revertedWith("Account of sender is not active");
    })
})

describe('Pause / Unpause deposits', function() {

    it('should pause deposits', async function () {
        await blxbank.pause()
        await expect(blxbank.connect(wallet1).depositTokens(
            BLX,
            100,
        )).to.be.revertedWith("Paused at this moment");

        await blxbank.unPause()
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            100,
        )
        expect(account1[1]).to.equal(100);        
    })

    it('should unpause deposits', async function () {
        await blxbank.pause()
        await blxbank.unPause()
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            100,
        )
        expect(account1[1]).to.equal(100);   
    })
  })

describe('withdraw', function () {
    it('should withdraw BLXtokens from the contract', async function () {
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        expect(await blxbank.getGlobalBalanceOfTokens(BLX)).to.equal(600);

        await blxbank.connect(wallet1).withdrawTokens(
            BLX,
            100,
        );
        expect(await blxbank.getGlobalBalanceOfTokens(BLX)).to.equal(500);
    })

    it('should correctly display global bank balance of BLX token before and after deposit / withdraw', async function(){
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        
        await blxbank.connect(wallet1).withdrawTokens(
            BLX,
            100,
        );
    })

    it('should not allow withdrawing more than is available', async function(){
        await expect(
           blxbank.connect(wallet1).withdrawTokens(BLX, 10000)
        ).to.be.revertedWith("");
    })

    it('should not allow withdraw from inactive account', async function(){
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        await blxbank.connect(wallet1).deactivateBankAccount();
        await expect(
            blxbank.connect(wallet1).withdrawTokens(BLX, 100)
         ).to.be.revertedWith("Account of sender is not active");
    })
  })

describe('transfer', function () {
    it('should transfer BLXtokens to another active bank account', async function () {
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        
        await blxbank.connect(wallet1).transferToAnotherAccount(
            wallet2.address,
            BLX,
            250,
        );
        account1 = await blxbank.addressToBankAccount(wallet1.address);
        account2 = await blxbank.addressToBankAccount(wallet2.address);

        expect(await blxtoken.balanceOf(wallet1.address)).to.equal(3400);
        expect(await blxtoken.balanceOf(wallet2.address)).to.equal(1000);
        expect(account1[2]).to.equal(350);
        expect(account2[2]).to.equal(250);
        expect(account1[1]).to.equal(350);
        expect(account2[1]).to.equal(250);
        expect(account1[4]).to.equal(2);
        expect(account2[4]).to.equal(1);
    })

    it('should not allow transfer more than is available', async function(){
        await expect(
            blxbank.connect(wallet1).transferToAnotherAccount(wallet2.address, BLX, 10000)
         ).to.be.revertedWith("");
    })

    it('should not allow transfer from inactive account', async function(){
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        await blxbank.connect(wallet1).deactivateBankAccount();
        await expect(
            blxbank.connect(wallet1).transferToAnotherAccount(wallet2.address, BLX, 100)
         ).to.be.revertedWith("Account of sender is not active");
    })

    it('should not allow transfer to inactive account', async function(){
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        await blxbank.connect(wallet2).deactivateBankAccount();
        await expect(
            blxbank.connect(wallet1).transferToAnotherAccount(wallet2.address, BLX, 100)
         ).to.be.revertedWith("Recipient is not active");
    })
  })

  describe('activation / deactivation', function() {

    it('should not allow activate already active accounts', async function () {
        await expect(
            blxbank.connect(wallet1).activateBankAccount()
         ).to.be.revertedWith("Account is already active");
    })

    it('should deactivate active account', async function () {
        await blxbank.connect(wallet1).deactivateBankAccount()
        account1 = await blxbank.addressToBankAccount(wallet1.address);
        expect(account1[5]).to.equal(false);
    })

    it('should activate non-active account', async function () {
        await blxbank.connect(owner).activateBankAccount();
        active = await blxbank.addressToBankAccount(owner.address);
        expect(active[5]).to.equal(true);
    })
  })

  describe('get functions', function() {

    it('should correctly display address of the owner of the bank ', async function () {
        expect(await blxbank.getOwnerAddress()).to.equal(owner.address);
    })

    it('should allow user to get information about his account - date of creation, balance, number of transaction if account is active ', async function () {
        await blxbank.connect(wallet1).deactivateBankAccount();
        await blxbank.connect(wallet1).activateBankAccount();
        await blxbank.connect(wallet1).depositTokens(
            BLX,
            100,
        );

        acc1ActivationTime = ((Date.now()+184710)-((Date.now()+184710)%1000))/1000;//+184710 or +185710

        AccountData = new Array();
        AccountData = await blxbank.connect(wallet1).getDataAboutAccount();
        createdAt = AccountData[0];
        totalBalance = AccountData[1];
        availableBalance = AccountData[2];
        lockedBalance = AccountData[3];
        transactionsCount = AccountData[4];
        isActive = AccountData[5];

        expect(createdAt).to.equal(acc1ActivationTime); 
        expect(totalBalance).to.equal(100);  
        expect(availableBalance).to.equal(100);  
        expect(lockedBalance).to.equal(0);  
        expect(transactionsCount).to.equal(1);  
        expect(isActive).to.equal(true);
    })
  })
})