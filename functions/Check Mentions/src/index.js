const { Databases, Client, Functions } = require("node-appwrite");
const { TwitterApi } = require("twitter-api-v2");

module.exports = async function (req, res) {
  const client = new Client();
  
  if (!req.variables['APPWRITE_FUNCTION_ENDPOINT'] || !req.variables['APPWRITE_FUNCTION_API_KEY']) {
    console.log("Environment variables are not set. Function cannot use Appwrite SDK.");
  } else {
    console.log(req.variables)
    client
    .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
    .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
    .setKey(req.variables['APPWRITE_FUNCTION_API_KEY'])
    .setSelfSigned(true);
  }
  const database = new Databases(client)
  const functions = new Functions(client);
  let data = await database.listDocuments(req.variables.DatabaseID, req.variables.CollectionID)

  try {
    const Bot = new TwitterApi({
      appKey: data.documents[0].appKey,
      appSecret: data.documents[0].appSecret,
      accessToken: data.documents[0].accessToken,
      accessSecret: data.documents[0].accessSecret,
    });
    const tweets = await Bot.v2.search("@QuotesBot687")
    functions.createExecution("6464bfbdcf70065e1559", JSON.stringify(tweets))
  } catch(err) {
    console.log(documents)
    console.log(err)
  }

  res.json({
    areDevelopersAwesome: true,
  });
};