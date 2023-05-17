const { Client, Databases } = require("node-appwrite");

module.exports = async function (req, res, tweets) {
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
  const database = new Databases(client);

  console.log(tweets, "Tweets above ✅")
  
  res.json({
    areDevelopersAwesome: true,
  });
};
