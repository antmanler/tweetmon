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

// Require mail libraries for Mailgun
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const mailgun = nodemailer.createTransport(mg({
	auth: {
		api_key: process.env.MAILGUN_API_KEY,
		domain: process.env.MAILGUN_DOMAIN,
	},
}));

exports.handler = function (event, context, callback) {
	ddb.get({
		TableName: 'tweetmon',
		Key: { 'key': 'last_checkpoint' },
	}, function (err, data) {
		if (err) {
			console.error('ddb get error:', err);
		} else {
			const { since_id } = data;
			console.log('since_id:', since_id);
			twitter.get(
				'statuses/user_timeline',
				{
					user_id: trumpUserID,
					exclude_replies: true,
					tweet_mode: 'extended',
					since_id,
				},
				function (error, tweets, response) {
					tweets.forEach((t, idx) => {
						if (idx === 0) {
							// remeber last checkpoint
							ddb.put({
								TableName: 'tweetmon',
								Item: { 'since_id': t.id_str },
							}, function (err, data) {
								if (err) {
									console.error('ddb put error:', err);
								}
							});
						}
						// For the very first invocation, 
						// we just write down the since id
						if (!since_id) {
							return;
						}
						// send tweet to mail
						content = JSON.stringify(t);
						mailgun.sendMail({
							from: process.env.MAILGUN_FROM,
							to: process.env.MAILGUN_TO,
							subject: `tweet from ${t.user.screen_name}`,
							text: content,
							attachments: [
								{
									filename: 'tweet.json',
									contentType: 'application/json',
									content,
								}
							],
						}, function (err, info) {
							if (err) {
								console.log('failed to send mail:', err);
							}
						})
					});
					console.log('tweets:', tweets);
				},
			);
		}
	});

	callback(null, 'Successfully executed');
}
