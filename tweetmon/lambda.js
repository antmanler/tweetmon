let AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const Twitter = require('twitter');

const twitter = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const trumpUserID = '25073877';

exports.handler = function (event, context, callback) {

	ddb.get({
		TableName: 'tweetmon',
		Key: { 'key': 'last_checkpoint' }
	}, function (err, data) {
		if (err) {
			console.error('ddb get error:', err);
		} else {
			const {since_id} = data;
			console.log('since_id:', since_id);

			twitter.get(
				'statuses/user_timeline',
				{
					user_id: trumpUserID,
					exclude_replies: true,
					since_id,
				},
				function (error, tweets, response) {
					console.log('tweets:', tweets);
				},
			);
		}
	});

	callback(null, 'Successfully executed');
}
