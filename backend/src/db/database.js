import mongoose from 'mongoose';

async function databaseConnection (){
    try {
        const connection = await  mongoose.connect(process.env.MONGO_URI);
        console.log('Database is hosted at ', connection.connection.host)
        return connection;
    } catch (error) {
    console.error('Database connection Error', error);    }
}

export default databaseConnection;