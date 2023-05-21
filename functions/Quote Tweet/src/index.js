const { Client, Databases } = require("node-appwrite");
const { TwitterApi} = require("twitter-api-v2");
const  fetch = require("node-fetch");

module.exports =  async function (req, res) {
  const client = new Client();
  const databases = new Databases(client)

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

  const data = await databases.listDocuments(req.variables.DatabaseID, req.variables.CollectionID)

  const Bot = new TwitterApi({
      appKey: data.documents[0].appKey,
      appSecret: data.documents[0].appSecret,
      accessToken: data.documents[0].accessToken,
      accessSecret: data.documents[0].accessSecret,
  })

  async function getQuote(){
    const req = await fetch("https://api.quotable.io/quotes/random?minLength=1&maxLength=280");
    const quoteObject = await req.json()
    const nextTweet = `"${quoteObject[0].content}" - ${quoteObject[0].author}\n#motivation #quotes #inspirationalquotes`;
    return nextTweet;
  }

  getQuote()
    .then(tweet => Bot.v2.tweet(tweet))
    .then(_ => console.log("Tweet Sent"))
    .catch(err => {
      Bot.v2.tweet("There was an error with the bot, hence, it is not working right now.")
      console.error(err)
    })

  res.json({
    "status": "success!"
  }, 200)
};
