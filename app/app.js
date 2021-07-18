var express = require('express');
let fetch = require('node-fetch');
const axios = require('axios');
const Web3 = require('web3');
const fs = require('fs');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
const decimal = 1000000000000000000;
const https = require('https');

var app = express();

app.get('/api/v1/addresses/:address', async function (req, res) {
	var data = await getData(req.params.address)
	//console.log(data);
	res.setHeader('Content-Type', 'application/json')
	res.send(JSON.stringify(data));
});


async function getData(address){
	let rawdata = fs.readFileSync('kebab.json');
	var metaData = JSON.parse(rawdata);
	var contractAddress = metaData.masterChefContract;
	var op = {}
	op.platform = metaData.platform;
	op.projectName = metaData.projectName;
	var poolDetails = []
	var totalDeposit = 0;
	var totalFarmed = 0;
	  for await (const pool of metaData.poolDetails) {
		var poolDetail = {}
		poolDetail.name = pool.poolName; 
		var poolId = pool.poolId;
		  var poolInfoRes = await poolInfo(metaData.abi, poolId, contractAddress);
		  var userInfoRes = await userInfo(metaData.abi, poolId, address, contractAddress);
		  poolDetail.stakedAmount = parseFloat(userInfoRes.amount)/decimal;
		  // need to break LP
		  totalDeposit += poolDetail.stakedAmount;
 		  if ((poolDetail.stakedAmount) > 0) {
			var pendingCakeRes = await pendingCake(metaData.abi, poolId, address, contractAddress);
			poolDetail.pendingAmount = pendingCakeRes/decimal;
			totalFarmed += poolDetail.pendingAmount;
		    poolDetails.push(poolDetail); 
 		  }
	  }
	op.totalDeposit = totalDeposit;
	op.totalFarmed = totalFarmed;
	op.poolDetails=poolDetails;
	processData(op);
	
	return op;
}

function processData(op) {
	console.log("processData");
	
}

async function pendingCake(abi, poolId, address, contractAddress){
	var result;
  		await new web3.eth.Contract(abi, contractAddress).methods.pendingCake(poolId, address).call()
					  .then((pendingCake) => {					  		
					    result = pendingCake;				    		
					  })
					  .catch(err => { console.log(err) });
	return result;
}

async function userInfo(abi, poolId, address, contractAddress){
	var result;
  		await new web3.eth.Contract(abi, contractAddress).methods.userInfo(poolId, address).call()
					  .then((userInfo) => {					  		
					    result = userInfo;				    		
					  })
					  .catch(err => { console.log(err) });
	return result;
}

async function poolInfo(abi, poolId, contractAddress){
	var result;
  		await new web3.eth.Contract(abi, contractAddress).methods.poolInfo(poolId).call()
					  .then((poolInfo) => {					  		
					    result = poolInfo;				    		
					  })
					  .catch(err => { console.log(err) });
	return result;
}


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
