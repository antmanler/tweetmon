let AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const Twitter = require('twitter');

const twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
});

exports.handler = function (event, context, callback) {

	ddb.get({
		TableName: 'tweetmon',
		Key: { 'key': 'last_checkpoint' }
	}, function (err, data) {
		if (err) {
			//handle error
			console.error(err);
		} else {
			//your logic goes here
			console.log(data);
		}
	});

	callback(null, 'Successfully executed');
}
