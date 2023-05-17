const { Client, Databases, Query } = require("node-appwrite");
const { TwitterApi } = require("twitter-api-v2");

module.exports = async function (req, res) {
  const client = new Client();

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

  const databases = new Databases(client);

  let documents = await databases.listDocuments("64645a31dbc67da320cf","64645a4ae7339e9f1cb5")

  try {
    const Bot = new TwitterApi({
      appKey: documents.appKey,
      appSecret: documents.appSecret,
      accessToken: documents.accessToken,
      accessSecret: documents.accessSecret,
    });
  } catch(err) {
    console.log(documents)
    console.log(err)
  }

  
  res.json({
    areDevelopersAwesome: true,
  });
};