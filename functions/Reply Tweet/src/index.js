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

  async function getReply(){
    let req = await fetch("https://zenquotes.io/api/random");
    let tweetObject = await req.json()
    let nextTweet = `"${tweetObject[0].q}" - ${tweetObject[0].a}\n#motivation #quotes #inspirationalquotes`
    if (nextTweet.length > 280){
      nextTweet = await getReply();
    } 
    return nextTweet
  }
  const mentions = JSON.parse(req.payload)._realData;
  for (const tweet of mentions.data) {
    const replies = await Bot.v2.get("tweets/search/recent",{query: `in_reply_to_tweet_id:${tweet.id} from:QuotesBot687` });
    if(tweet.text.toLowerCase().includes("give me a quote") && replies.meta.result_count === 0){      
      Bot.v2.reply(await getReply(), tweet.id);
      console.log("it definitely executed...")
    }
  }

  res.json({
    areDevelopersAwesome: true,
  });
};
