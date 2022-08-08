const { Client, Intents, MessageEmbed } = require("discord.js");
require("dotenv/config");

// constants
const test = process.env.ARETEST == 0;
const constants = test
    ? require("./testConstants.json")
    : require("./constants.json");

// modules
const counting = require("./modules/counting.js");
const join = require("./modules/join.js");
const qotd = require("./modules/qotd.js");
const admin = require("./modules/admin.js");
const topicPings = require("./modules/topicPings.js");
const commands = require("./modules/commands.js");
const historicalMessages = require("./modules/historicalMessages.js");

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

const client = new Client({
    intents: intents,
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.login(test ? process.env.TEST : process.env.TOKEN);
client.once("ready", () => {
    console.log("Bots on");
    ask();
});
var channel = 0;

client.on("messageCreate", (message) => {
    if (channel == 0) {
        channel = message.channel;
        console.log("fog");
    }
});

const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask() {
    readline.question("Send: ", (name) => {
        channel.send(name);
        ask();
    });
}
