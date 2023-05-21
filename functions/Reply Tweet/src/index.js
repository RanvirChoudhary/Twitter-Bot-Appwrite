const { Client, Databases } = require("node-appwrite");
const { TwitterApi } = require("twitter-api-v2");
const  fetch = require("node-fetch");

module.exports = async function (req, res) {
  const client = new Client();
  const database = new Databases(client);
  
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
  const data = await database.listDocuments(req.variables.DatabaseID, req.variables.CollectionID)

  const Bot = new TwitterApi({
    appKey: data.documents[0].appKey,
    appSecret: data.documents[0].appSecret,
    accessToken: data.documents[0].accessToken,
    accessSecret: data.documents[0].accessSecret,
  });

  async function getQuote(){
    const req = await fetch("https://api.quotable.io/quotes/random?minLength=1&maxLength=280");
    const quoteObject = await req.json()
    const nextTweet = `"${quoteObject[0].content}" - ${quoteObject[0].author}\n#motivation #quotes #inspirationalquotes`;
    return nextTweet;
  }

  const mentions = JSON.parse(req.payload)._realData;
  for (const tweet of mentions.data) {
    // get all replies to the tweet and checks so the bot only replies once
    const replies = await Bot.v2.get("tweets/search/recent",{query: `in_reply_to_tweet_id:${tweet.id} from:QuotesBot687` });
    if(tweet.text.toLowerCase().includes("give me a quote") && replies.meta.result_count === 0){      
      Bot.v2.reply(await getQuote(), tweet.id);
    }
  }

  res.json({
    "status": "success!"
  }, 200)
};
