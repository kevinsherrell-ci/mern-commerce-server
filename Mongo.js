const {MongoClient} = require("mongodb");

let database;

async function mongoConnect(){
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);

    try{
        await client.connect();
        database = await client.db(process.env.MONGO_DATABASE);

        console.log("db connected");
    }catch(error){
        throw Error("Could not connect to MongoDB." + error);
    }
}

function db(){
    return database;
}
module.exports = {
    mongoConnect,
    db
}