const { Databases, Client, Functions } = require("node-appwrite");
const { TwitterApi } = require("twitter-api-v2");

module.exports = async function (req, res) {
  const client = new Client();
  
  if (!req.variables['APPWRITE_FUNCTION_ENDPOINT'] || !req.variables['APPWRITE_FUNCTION_API_KEY']) {
    console.log("Environment variables are not set. Function cannot use Appwrite SDK.");
  } else {
    client
    .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
    .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
    .setKey(req.variables['APPWRITE_FUNCTION_API_KEY'])
    .setSelfSigned(true);
  }
  const database = new Databases(client)
  const functions = new Functions(client);
  const data = await database.listDocuments(req.variables.DatabaseID, req.variables.CollectionID)

  const Bot = new TwitterApi({
    appKey: data.documents[0].appKey,
    appSecret: data.documents[0].appSecret,
    accessToken: data.documents[0].accessToken,
    accessSecret: data.documents[0].accessSecret,
  });

  //Gets mentions to bot and then calls reply function 
  const mentions = await Bot.v2.userMentionTimeline((await Bot.v2.me()).data.id)
  functions.createExecution(req.variables.replyFunctionID, JSON.stringify(mentions));

  res.json({
    "status": "success!"
  }, 200)
};