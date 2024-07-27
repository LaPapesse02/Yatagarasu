import * as mongoose from 'mongoose';
import { database_url } from '../secrets.json';


mongoose.connect(database_url);

const serverSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true },
        updateChannel: { type: Number, required: true }
    }
);

const seriesSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true },
        latestChapter: { type: Number, required: true },
        servers: [{
            id: { type: Number, required: true },
            subscribers: [ Number ]
        }],
    }
);

const Server = mongoose.model("Server", serverSchema);
const Series = mongoose.model("Series", seriesSchema);

/*
* Check if the server is already saved in the database.
* If it is, change the updateChannel, if it isn´t create a new document
*/
export const changeServerUpdateChannel = async (id: number, updateChannel: number) => {
    if (await Server.findOne({ id: id })) {
        await Server.updateOne({ id: id }, { updateChannel: updateChannel });
    } else {
        await Server.insertMany({ id: id, updateChannel: updateChannel });
    }
};

const removeServer = async (id: number) => {
    await Server.deleteOne({ id: id });
}
