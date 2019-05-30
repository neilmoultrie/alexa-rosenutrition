var AWS = require("aws-sdk");

AWS.config.update({
	endpoint:"https://dynamodb.eu-west-1.amazonaws.com"
});

const table = "Alexameals";

var dbHelper = function() {};

var docClient = new AWS.DynamoDB.DocumentClient();

dbHelper.prototype.logMeal = (mealtime, food, group, fatScore) => {
	return new Promise((resolve, reject) => {
		var date = new Date();
		var day = date.getUTCDate();
		var month = date.getUTCMonth();
		var currentMonth = month + 1;
		var year = date.getUTCFullYear();
	
		var today = year + "-" + currentMonth + "-" + day;
	
		var params = {
			TableName: table,
			Item: {
				"Mealtime": mealtime,
				"FoodEaten": food,
				"Date": today,
				"FoodGroup": group,
				"FatScore": fatScore
			}
		};
		
		docClient.put(params, (err, data) => {
			if(err) {
				console.error("Unable to add item. Error JSON:", JSON.stringify(err));
				return reject("Unable to insert");
			}
			
			console.log("Added item: ", JSON.stringify(data, null, 2));
			resolve(data);
		});
	});
}

dbHelper.prototype.getMeal = (mealtime, correctDay, correctMonth) => {
	return new Promise((resolve, reject) => {
		var date = new Date();
		var year = date.getUTCFullYear();
	
		var dateToGet = year + "-" + correctMonth + "-" + correctDay;
		console.log(dateToGet);
	
		var params = {
			TableName: table,
			KeyConditionExpression: "#mealtime = :mealtime and #dateToGet = :dateToGet",
			ExpressionAttributeNames : {
				"#mealtime": "Mealtime",
				"#dateToGet": "Date"
			},
			ExpressionAttributeValues: {
				":mealtime": mealtime,
				":dateToGet": dateToGet
			}
		};
	
		docClient.query(params, function(err, data) {
			if(err) {
				console.error("Unable to read item. Error JSON: ", JSON.stringify(err, null, 2));
			}
			
			console.log("Got item successfully! : ", JSON.stringify(data, null, 2));
			resolve(data.Items);
		});
	});
}

module.exports = new dbHelper();