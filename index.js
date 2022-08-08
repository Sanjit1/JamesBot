// why not: https://discord.js.org/#/docs/discord.js/
// libraries
const { Client, Intents, MessageEmbed } = require("discord.js");
require("dotenv/config");

// constants
const test = process.env.ARETEST == 1;
const constants = test
    ? require("./testConstants.json")
    : require("./constants.json");

// modules
const admin = require("./modules/admin.js");
const commands = require("./modules/commands.js");
const counting = require("./modules/counting.js");
const events = require("./modules/events.js");
const historicalMessages = require("./modules/historicalMessages.js");
const join = require("./modules/join.js");
const qotd = require("./modules/qotd.js");
const topicPings = require("./modules/topicPings.js");

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

var date;

const client = new Client({
    intents: intents,
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
client.login(test ? process.env.TEST : process.env.TOKEN);
client.once("ready", () => {
    console.log("Bots on");
    date = new Date();
    if (date.getHours() > 8) {
        date.setDate(date.getDate() + 1);
    }
    date.setHours(8);
    date.setMinutes(0);
    date.setSeconds(0);
    date2 = new Date();

    function at8AM() {
        // birthdays.check(client);
        console.log("IT IS NOW 8 AM.");
        events.at8AM(client);
    }

    setTimeout(() => {
        // It is now 8 AM. Good Morning let us set an interval to do stuff every 8 am.
        at8AM();
        setInterval(() => {
            // Hello, it is once again 8 AM.
            at8AM();
        }, 86400000);
    }, date - date2);
});

client.on("messageCreate", (message) => {
    if (message.channel.type === "DM") return;

    if (
        !message.author.bot &&
        ![
            constants.channels.mod,
            constants.channels.james,
            constants.channels.logs,
        ].includes(message.channel.id)
    )
        topicPings.handle(message);

    if (message.content.startsWith("8AM")) {
        events.at8AM(client);
    }

    // Channel Handler
    if (message.channelId == constants.channels.counting) {
        counting.handle(message);
    } else if (message.channelId == constants.channels["join-logs"]) {
        join.handle(message);
    } else if (message.channelId == constants.channels) {
    }

    if (message.content.startsWith("j.")) {
        if (message.member.permissions.has("ADMINISTRATOR")) {
            admin.handle(message);
        } else {
            message.channel.send("Oh silly you are not an admin.");
        }
    } else if (
        message.content.startsWith("j!pings") &&
        message.channelId == constants.channels.bots
    ) {
        topicPings.commands(message);
    } else if (
        message.content.startsWith("j!events") &&
        message.channelId == constants.channels.meetups
    ) {
        events.commands(message);
    } else if (
        message.content.startsWith("j!pings") &&
        message.channelId == constants.channels.bots
    ) {
        birthdays.commands(message);
    } else if (message.content.startsWith("j!")) {
        commands.handle(message);
    }
});

client.on("messageDelete", (message) => {
    // Delete Handler
    if (message.channelId == constants.channels.counting) {
        counting.handleDel(message);
    }
});

client.on("messageUpdate", (oldMessage, newMessage) => {
    // Edit Handler
    if (oldMessage.channelId == constants.channels.counting) {
        counting.handleEdit(oldMessage, newMessage);
    }
});

client.on("messageReactionAdd", (reaction, user) => {
    // Reactions Handler
    if (reaction.message.channelId == constants.channels.suggestions) {
        qotd.handleReaction(reaction, user, constants.users.sanjit);
    }
    if (
        ["luna", "jack", "baby", "rose", "alexis"].includes(reaction.emoji.name)
    ) {
        historicalMessages.handle(reaction);
    }
});

client.on("interactionCreate", (interaction) => {
    admin.interactionCreate(interaction);
    events.interactionCreate(interaction);
});
