const sdk = require("node-appwrite");
const { TwitterApi} = require("twitter-api-v2");
const  dotenv = require("dotenv");
const  fetch = require("node-fetch");
dotenv.config();

module.exports =  async function (req, res) {
  const client = new sdk.Client();
  const functions = new sdk.Functions(client);

  if (
    !req.variables['APPWRITE_FUNCTION_ENDPOINT'] ||
    !req.variables['APPWRITE_FUNCTION_API_KEY']
  ) {
    console.warn("Environment variables are not set. Function cannot use Appwrite SDK.");
  } else {
    client
      .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
      .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
      .setKey(req.variables['APPWRITE_FUNCTION_API_KEY'])
      .setSelfSigned(true);
  }

  const Bot = new TwitterApi({
    appKey: req.variables.appKey,
    appSecret: req.variables.appSecret,
    accessToken: req.variables.accessToken,
    accessSecret: req.variables.accessSecret,
  });

  async function getNextTweet(){
    let req = await fetch("https://zenquotes.io/api/random");
    let tweetObject = await req.json()
    let nextTweet = `"${tweetObject[0].q}" - ${tweetObject[0].a}`
    if (nextTweet.length > 280){
      return getNextTweet();
    } else {
      return nextTweet
    }
  }

  getNextTweet()
    .then((tweet) => Bot.v2.tweet(tweet))
    .then(_ => console.log("Tweet Sent"))
    .catch((err) => {
      Bot.v2.tweet("There was an error with the bot, hence, it is not working right now.")
      console.error(err)
      process.exit()
    })

  res.json({
    "status": "success!"
  }, 200)
};
