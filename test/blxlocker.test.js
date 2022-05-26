const { expect } = require("chai");
const { ethers } = require('hardhat');

describe.skip('BLXLocker', function (){
    beforeEach(async function(){
        [owner, wallet1, wallet2] = await ethers.getSigners();

        BLXLocker = await ethers.getContractFactory('BLXLocker', owner);
        BLXToken = await ethers.getContractFactory('BLXToken', wallet1);
        blxlocker = await BLXLocker.deploy();
        blxtoken = await BLXToken.deploy();
        
        blxtoken.connect(wallet1).transfer(wallet2.address, 1000);

        await blxtoken.connect(wallet1).approve(
            blxlocker.address,
            4000
        );
        await blxtoken.connect(wallet2).approve(
            blxlocker.address,
            1000
        );

        BLX = ethers.utils.formatBytes32String('BLX');
        await blxlocker.whitelistToken(
            BLX,
            blxtoken.address
        );

        await blxlocker.connect(wallet1).activateBankAccount();

        await blxlocker.connect(wallet2).activateBankAccount();

        await blxlocker.connect(wallet1).depositTokens(
            BLX,
            2200,
        );
        await blxlocker.connect(wallet2).depositTokens(
            BLX,
            700,
        );

    });

describe('deployment', function() {
        
    it('should mint tokens to wallet 1', async function () {
        expect(await blxtoken.balanceOf(wallet1.address)).to.equal(1800);
    })
    
    it('should transfer tokens to wallet 2', async function () {
        expect(await blxtoken.balanceOf(wallet2.address)).to.equal(300);
    })    
    
    it('should whitelist BLXtokens on the contract', async function () {
        expect(
            await blxlocker.whitelistedTokens(BLX)
        ).to.equal(blxtoken.address);
    }) 
    
    it('should deposit some tokens to account1 and account2', async function () {
        account1 = await blxlocker.addressToBankAccount(wallet1.address);
        account2 = await blxlocker.addressToBankAccount(wallet2.address);
        expect(account1[1]).to.equal(2200);
        expect(account2[1]).to.equal(700);    
    })          
})

describe('create Lock', function() {
    beforeEach(async function(){
        starttime = ((Date.now()+184710)-((Date.now()+184710)%1000))/1000;//+184710 or +185710
        endtime = starttime + 200;
 
         await blxlocker.connect(wallet1).createTheLock(wallet2.address,
                                                        starttime,
                                                        endtime,
                                                        BLX,
                                                        200);
 
         account1 = await blxlocker.addressToBankAccount(wallet1.address);
         account2 = await blxlocker.addressToBankAccount(wallet2.address);
         LockData = new Array();
         LockData = await blxlocker.connect(wallet2).getAllLocksForSender();
         _starttime = LockData[0][0];
         _endTime = LockData[0][1];
         _lockedValue = LockData[0][2];
         _unlockedValue = LockData[0][3];
         _claimed = LockData[0][4];
    });
    
    
    it('should change total and available balances of sender', async function () {
        await expect(account1[2]).to.equal(2000);   
        await expect(account1[1]).to.equal(2000);                                   
    })
    
    it('should change total and locked balances of recipient', async function () {
        await expect(account2[1]).to.equal(900);   
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
 
         await blxlocker.connect(wallet1).createTheLock(wallet2.address,
                                                        starttime,
                                                        endtime,
                                                        BLX,
                                                        300);
         LockData = new Array();
         LockData = await blxlocker.connect(wallet2).getAllLocksForSender();
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
        //Create first lock
        starttime1 = (Date.now() - (Date.now()%1000))/1000;
        endtime1 = starttime1 + 0;
 
         await blxlocker.connect(wallet1).createTheLock(wallet2.address,
                                                        starttime1,
                                                        endtime1,
                                                        BLX,
                                                        200);
        
         //Create second lock                             
         starttime2 = ((Date.now()+181710)-((Date.now()+181710)%1000))/1000;//Actual time from Javascript and Solidity are slightly different
                                                                            //+181710 up to +185710 need to be changed manual
         endtime2 = starttime + 200;
  
          await blxlocker.connect(wallet1).createTheLock(wallet2.address,
                                                         starttime2,
                                                         endtime2,
                                                         BLX,
                                                         300);                                                   
    });
    
    it('should get the amount of tokens that are unlocked in the given lock', async function () {
        await blxlocker.connect(wallet2).getUnlockedAmountForLock(0);
        LockData = new Array();
        LockData = await blxlocker.connect(wallet2).getAllLocksForSender();
        unlockedValue = LockData[0][3];
        expect(unlockedValue).to.equal(200);    
    })
    
    it('should return 0 if time of Lock is not ended', async function () {
        await blxlocker.connect(wallet2).getUnlockedAmountForLock(1);
        LockData = new Array();
        LockData = await blxlocker.connect(wallet2).getAllLocksForSender();
        unlockedValue = LockData[1][3];
        expect(unlockedValue).to.equal(0);    
    })
    
    describe('after tokens were claimed', function() {
    beforeEach(async function(){
        await blxlocker.connect(wallet2).claimUnlockedValue(0,BLX,50);
        LockData = new Array();
        LockData = await blxlocker.connect(wallet2).getAllLocksForSender();
    });
    
    it('should get the amount of tokens that user already claimed in the given lock', async function () {
        _claimed = LockData[0][4];
        expect(_claimed).to.equal(50); 
    })

    it('should get the total balance of all locked tokens from all locks that were created for user', async function () {
        allLockedBalance = await blxlocker.connect(wallet2).getAllLockedBalance();
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