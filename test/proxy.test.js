const { expect } = require("chai");
const { ethers } = require('hardhat');

describe('FIRST FUNCTIONAL CONTRACT(BLXBank) delegating from proxy', function (){
    beforeEach(async function(){
        [owner, wallet1, wallet2] = await ethers.getSigners();

        BLXBank = await ethers.getContractFactory('BLXBank', owner);
        BLXToken = await ethers.getContractFactory('BLXToken', wallet1);
        PROXY = await ethers.getContractFactory('Proxy', owner);
        blxbank = await BLXBank.deploy();
        blxtoken = await BLXToken.deploy();
        proxy = await PROXY.deploy(blxbank.address);

        proxiedBLX = await BLXBank.attach(proxy.address);
        await proxiedBLX.initialize(owner.address);
        
        blxtoken.connect(wallet1).transfer(wallet2.address, 1000);

        await blxtoken.connect(wallet1).approve(
            proxiedBLX.address,
            4000
        );
        await blxtoken.connect(wallet2).approve(
            proxiedBLX.address,
            1000
        );

        BLX = ethers.utils.formatBytes32String('BLX');
        await proxiedBLX.whitelistToken(
            BLX,
            blxtoken.address
        );

        await proxiedBLX.connect(wallet1).activateBankAccount();


        await proxiedBLX.connect(wallet2).activateBankAccount();
    });

describe('deployment', function() {
    it('should mint tokens to wallet 1', async function () {
        expect(await blxtoken.balanceOf(wallet1.address)).to.equal(4000);
    })
    it('should transfer tokens to wallet 2', async function () {
        expect(await blxtoken.balanceOf(wallet2.address)).to.equal(1000);
    })    
    it('should whitelist BLXtokens on the Proxy contract', async function () {
        expect(
            await proxiedBLX.whitelistedTokens(BLX)
        ).to.equal(blxtoken.address);
    })      
})

describe('depositTokens via proxy', function () {
    it('should deposit BLXtokens', async function () {
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            100,
        );
        await proxiedBLX.connect(wallet2).depositTokens(
            BLX,
            50,
        );

        expect(await blxtoken.balanceOf(wallet1.address)).to.equal(3900);
        expect(await blxtoken.balanceOf(wallet2.address)).to.equal(950);   
        account1 = await proxiedBLX.addressToBankAccount(wallet1.address);
        account2 = await proxiedBLX.addressToBankAccount(wallet2.address);

        expect(account1[1]).to.equal(100);
        expect(account2[1]).to.equal(50);     
        expect(account2[4]).to.equal(1);  
        expect(account2[4]).to.equal(1); 
        
    })

    it('should not allow deposit to inactive account', async function(){
        await proxiedBLX.connect(wallet1).deactivateBankAccount();
        await expect(proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            600,
        )).to.be.revertedWith("Account of sender is not active");
    })
})

describe('Pause / Unpause deposits via proxy', function() {

    it('should pause deposits', async function () {
        await proxiedBLX.pause()
        await expect(proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            100,
        )).to.be.revertedWith("Paused at this moment");

        await proxiedBLX.unPause()
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            100,
        )
        expect(account1[1]).to.equal(100);        
    })

    it('should unpause deposits', async function () {
        await proxiedBLX.pause()
        await proxiedBLX.unPause()
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            100,
        )
        expect(account1[1]).to.equal(100);   
    })
  })

describe('withdraw via proxy', function () {
    it('should withdraw BLXtokens from the contract', async function () {
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        expect(await proxiedBLX.getGlobalBalanceOfTokens(BLX)).to.equal(600);

        await proxiedBLX.connect(wallet1).withdrawTokens(
            BLX,
            100,
        );
        expect(await proxiedBLX.getGlobalBalanceOfTokens(BLX)).to.equal(500);
    })

    it('should correctly display global bank balance of BLX token before and after deposit / withdraw', async function(){
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        
        await proxiedBLX.connect(wallet1).withdrawTokens(
            BLX,
            100,
        );
    })

    it('should not allow withdrawing more than is available', async function(){
        await expect(
           proxiedBLX.connect(wallet1).withdrawTokens(BLX, 10000)
        ).to.be.revertedWith("");
    })

    it('should not allow withdraw from inactive account', async function(){
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        await proxiedBLX.connect(wallet1).deactivateBankAccount();
        await expect(
            proxiedBLX.connect(wallet1).withdrawTokens(BLX, 100)
         ).to.be.revertedWith("Account of sender is not active");
    })
  })

describe('transfer', function () {
    it('should transfer BLXtokens to another active bank account', async function () {
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        
        await proxiedBLX.connect(wallet1).transferToAnotherAccount(
            wallet2.address,
            BLX,
            250,
        );
        account1 = await proxiedBLX.addressToBankAccount(wallet1.address);
        account2 = await proxiedBLX.addressToBankAccount(wallet2.address);

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
            proxiedBLX.connect(wallet1).transferToAnotherAccount(wallet2.address, BLX, 10000)
         ).to.be.revertedWith("");
    })

    it('should not allow transfer from inactive account', async function(){
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        await proxiedBLX.connect(wallet1).deactivateBankAccount();
        await expect(
            proxiedBLX.connect(wallet1).transferToAnotherAccount(wallet2.address, BLX, 100)
         ).to.be.revertedWith("Account of sender is not active");
    })

    it('should not allow transfer to inactive account', async function(){
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            600,
        );
        await proxiedBLX.connect(wallet2).deactivateBankAccount();
        await expect(
            proxiedBLX.connect(wallet1).transferToAnotherAccount(wallet2.address, BLX, 100)
         ).to.be.revertedWith("Recipient is not active");
    })
  })

  describe('activation / deactivation', function() {

    it('should not allow activate already active accounts', async function () {
        await expect(
            proxiedBLX.connect(wallet1).activateBankAccount()
         ).to.be.revertedWith("Account is already active");
    })

    it('should deactivate active account', async function () {
        await proxiedBLX.connect(wallet1).deactivateBankAccount()
        account1 = await proxiedBLX.addressToBankAccount(wallet1.address);
        expect(account1[5]).to.equal(false);
    })

    it('should activate non-active account', async function () {
        await proxiedBLX.connect(owner).activateBankAccount();
        active = await proxiedBLX.addressToBankAccount(owner.address);
        expect(active[5]).to.equal(true);
    })
  })

  describe('get functions', function() {

    it('should correctly display address of the owner of the bank ', async function () {
        expect(await proxiedBLX.getOwnerAddress()).to.equal(owner.address);
    })
  })
describe('UPGRADED TO BLXLocker FUNCTIONAL CONTRACT', function (){
 describe('should use createLock function of upgraded contract', function (){
  beforeEach(async function(){
    BLXLocker = await ethers.getContractFactory('BLXLocker', owner);
    blxlocker = await BLXLocker.deploy();

    await proxy.upgrade(blxlocker.address);

    proxiedBLX = await BLXLocker.attach(proxy.address);
    await proxiedBLX.connect(wallet1).depositTokens(
        BLX,
        2000,
    );
    await proxiedBLX.connect(wallet2).depositTokens(
        BLX,
        500,
    );

    starttime = ((Date.now()+1280710)-((Date.now()+1280710)%1000))/1000;//+184710 or +185710
    endtime = starttime + 200;

     await proxiedBLX.connect(wallet1).createTheLock(wallet2.address,
                                                    starttime,
                                                    endtime,
                                                    BLX,
                                                    200);

     account1 = await proxiedBLX.addressToBankAccount(wallet1.address);
     account2 = await proxiedBLX.addressToBankAccount(wallet2.address);
     LockData = new Array();
     LockData = await proxiedBLX.connect(wallet2).getAllLocksForSender();
     _starttime = LockData[0][0];
     _endTime = LockData[0][1];
     _lockedValue = LockData[0][2];
     _unlockedValue = LockData[0][3];
     _claimed = LockData[0][4];
})

    it('should change total and available balances of sender', async function () {
         await expect(account1[1]).to.equal(1800);   
         await expect(account1[2]).to.equal(1800); 
    })

    it('should change total and locked balances of recipient', async function () {
        await expect(account2[1]).to.equal(700);   
        await expect(account2[3]).to.equal(200);  
    })
    
    it('should get all locks that were created for user', async function () {
        await expect(_starttime).to.equal(starttime);     
        await expect(_endTime).to.equal(endtime);    
        await expect(_lockedValue).to.equal(200);    
        await expect(_unlockedValue).to.equal(0);    
        await expect(_claimed).to.equal(0);   
        starttime = ((Date.now()+184710)-((Date.now()+184710)%1000))/1000;//+184710 or +185710
        endtime = starttime + 200;
 
         await proxiedBLX.connect(wallet1).createTheLock(wallet2.address,
                                                        starttime,
                                                        endtime,
                                                        BLX,
                                                        300);
         LockData = new Array();
         LockData = await proxiedBLX.connect(wallet2).getAllLocksForSender();
         _starttime = LockData[1][0];
         _endTime = LockData[1][1];
         _lockedValue = LockData[1][2];
         _unlockedValue = LockData[1][3];
         _claimed = LockData[1][4];
         await expect(_starttime).to.equal(starttime);     
         await expect(_endTime).to.equal(endtime);    
         await expect(_lockedValue).to.equal(300);    
         await expect(_unlockedValue).to.equal(0);    
         await expect(_claimed).to.equal(0);   
    })
})
describe('claim Lock', function() {
    beforeEach(async function(){
        BLXLocker = await ethers.getContractFactory('BLXLocker', owner);
        blxlocker = await BLXLocker.deploy();
    
        await proxy.upgrade(blxlocker.address);
    
        proxiedBLX = await BLXLocker.attach(proxy.address);
        await proxiedBLX.connect(wallet1).depositTokens(
            BLX,
            2200,
        );
        await proxiedBLX.connect(wallet2).depositTokens(
            BLX,
            700,
        );
        //Create first lock
        starttime1 = (Date.now() - (Date.now()%1000))/1000;
        endtime1 = starttime1 + 0;
 
         await proxiedBLX.connect(wallet1).createTheLock(wallet2.address,
                                                        starttime1,
                                                        endtime1,
                                                        BLX,
                                                        200);
        
         //Create second lock
         starttime2 = ((Date.now()+184710)-((Date.now()+184710)%1000))/1000;//+184710 or +185710
         endtime2 = starttime + 20000;
  
          await proxiedBLX.connect(wallet1).createTheLock(wallet2.address,
                                                         starttime2,
                                                         endtime2,
                                                         BLX,
                                                         300);                                                   
    });
    
    it('should get the amount of tokens that are unlocked in the given lock', async function () {
        await proxiedBLX.connect(wallet2).getUnlockedAmountForLock(0);
        LockData = new Array();
        LockData = await proxiedBLX.connect(wallet2).getAllLocksForSender();
        unlockedValue = LockData[0][3];
        expect(unlockedValue).to.equal(200);    
    })
    
    it('should return 0 if time of Lock is not ended', async function () {
        await proxiedBLX.connect(wallet2).getUnlockedAmountForLock(1);
        LockData = new Array();
        LockData = await proxiedBLX.connect(wallet2).getAllLocksForSender();
        unlockedValue = LockData[1][3];
        expect(unlockedValue).to.equal(0);    
    })
    
    describe('after tokens were claimed', function() {
    beforeEach(async function(){
        await proxiedBLX.connect(wallet2).claimUnlockedValue(0,BLX,50);
        LockData = new Array();
        LockData = await proxiedBLX.connect(wallet2).getAllLocksForSender();
    });
    
    it('should get the amount of tokens that user already claimed in the given lock', async function () {
        _claimed = LockData[0][4];
        expect(_claimed).to.equal(50); 
    })

    it('should get the total balance of all locked tokens from all locks that were created for user', async function () {
        allLockedBalance = await proxiedBLX.connect(wallet2).getAllLockedBalance();
        expect(allLockedBalance).to.equal(300); 
    })
    it('should check all changes after tokens was claimed', async function () {
        _starttime = LockData[0][0];
        _endTime = LockData[0][1];
        _lockedValue = LockData[0][2];
        _unlockedValue = LockData[0][3];
        _claimed = LockData[0][4];
  
        await expect(_lockedValue).to.equal(0);    
        await expect(_unlockedValue).to.equal(150);    
        await expect(_claimed).to.equal(50);   

        _starttime = LockData[1][0];
        _endTime = LockData[1][1];
        _lockedValue = LockData[1][2];
        _unlockedValue = LockData[1][3];
        _claimed = LockData[1][4];

        await expect(_lockedValue).to.equal(300);    
        await expect(_unlockedValue).to.equal(0);    
        await expect(_claimed).to.equal(0);   
    })
})
})
})  
})     