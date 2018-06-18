let AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const Twitter = require('twitter');

const twitter = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
});

const trumpUserID = '25073877';

exports.handler = function (event, context, callback) {

	ddb.get({
		TableName: 'tweetmon',
		Key: { 'key': 'last_checkpoint' }
	}, function (err, data) {
		if (err) {
			//handle error
			console.error(err);
		} else {
			const since_id = data;
			console.log(since_id);

			twitter.get(
				'statuses/user_timeline',
				{
					user_id: trumpUserID,
					exclude_replies: true,
					since_id,
				},
				function (error, tweets, response) {
					console.log(tweets);
				},
			);
		}
	});

	callback(null, 'Successfully executed');
}
