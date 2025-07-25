import mongoose from "mongoose";

type connectionObject = {
    isConnected?: number;
}

const connection: connectionObject = {} 

async function dbConnect(): Promise<void> {
    if( connection.isConnected){
        console.log("Already connected to the database")
        return;
    }

    try{
        const db = await mongoose.connect(process.env.MONGODN_URI || "" , {})

        console.log(db)

        connection.isConnected = db.connections[0].readyState

        console.log("Database connection state:" , connection.isConnected)

        console.log("Connected to the database successfully")

    }catch(error){
        console.error("Error connecting to the database:", error);
        
        process.exit(1)
    }

}

export default dbConnect;