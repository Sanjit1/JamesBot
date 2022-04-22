// why not: https://discord.js.org/#/docs/discord.js/
// libraries
const { Client, Intents } = require("discord.js");
require("dotenv/config");

// constants
const test = process.env.ARETEST == 1;
const constants = test
    ? require("./testConstants.json")
    : require("./constants.json");

// modules
const counting = require("./modules/counting.js");
const join = require("./modules/join.js");

// Basic Init Stuff
const intents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,
    Intents.FLAGS.GUILD_WEBHOOKS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
];

const client = new Client({ intents: intents });
client.login(test ? process.env.TEST : process.env.TOKEN);
client.once("ready", () => {
    console.log("Bots on");
});

client.on("messageCreate", (message) => {
    // Channel Handler
    if (message.channelId == constants.channels.counting) {
        counting.handle(message);
    } else if (message.channelId == constants.channels["join-logs"]) {
        join.handle(message);
    } else if (message.channelId == constants.channels) {
    }
});
