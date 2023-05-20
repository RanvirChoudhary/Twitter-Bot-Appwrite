const { Client, Databases } = require("node-appwrite");
const { TwitterApi} = require("twitter-api-v2");
const  fetch = require("node-fetch");

module.exports =  async function (req, res) {
  const client = new Client();

  if (
    !req.variables['APPWRITE_FUNCTION_ENDPOINT'] ||
    !req.variables['APPWRITE_FUNCTION_API_KEY']
  ) {
    console.log("Environment variables are not set. Function cannot use Appwrite SDK.");
  } else {
    client
      .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
      .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
      .setKey(req.variables['APPWRITE_FUNCTION_API_KEY'])
      .setSelfSigned(true);
  }

  const databases = new Databases(client)
  let data = await databases.listDocuments(req.variables.DatabaseID, req.variables.CollectionID)

  let Bot;
  try {
    Bot = new TwitterApi({
      appKey: data.documents[0].appKey,
      appSecret: data.documents[0].appSecret,
      accessToken: data.documents[0].accessToken,
      accessSecret: data.documents[0].accessSecret,
    });
  } catch(err) {
    console.log(documents)
    console.log(err)
  }

  async function getNextTweet(){
    let req = await fetch("https://zenquotes.io/api/random");
    let tweetObject = await req.json()
    let nextTweet = `"${tweetObject[0].q}" - ${tweetObject[0].a}\n#motivation #quotes #inspirationalquotes`
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
