// why not: https://discord.js.org/#/docs/discord.js/
require("dotenv/config");

const fs = require("fs");
const { Client, Intents, MessageEmbed } = require("discord.js");
var storage = fs.readFileSync("./storage.json");
var parsedStorage = JSON.parse(storage);

// constants
const test = process.env.ARETEST == 1;
const constants = test
    ? require("./../testConstants.json")
    : require("./../constants.json");

const handle = (message) => {
    storage = fs.readFileSync("./storage.json");
    parsedStorage = JSON.parse(storage);
    // update storage.
    if (
        message.content.startsWith("j!help") &&
        message.channelId == constants.channels.bots
    ) {
        var helpMenu = new MessageEmbed()
            .setColor("#decaf5")
            .setTitle("James' Help Menu")
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL(),
            })
            .setDescription("Welcome to James")
            .addFields(
                {
                    name: "j!help",
                    value: "Brings up this help menu. May only be used in bots-spam-the-ham",
                    inline: true,
                },
                {
                    name: "j!count next",
                    value: "Shows the next count for counting. May only be used in bots-spam-the-ham and counting",
                    inline: true,
                },
                {
                    name: "j!count top <#>",
                    value: "Shows the counting leaderboard. May only be used in bots-spam-the-ham.",
                    inline: true,
                },
                {
                    name: "j!count rank <user>",
                    value: "Shows the counting rank of the user mentioned. May only be used in bots-spam-the-ham",
                    inline: true,
                },
                {
                    name: "j!pings add <topic>",
                    value: "Adds a topic to your ping list. If this topic is mentioned in chat, I, James, will dm you. May only be used in bots-spam-the-ham",
                    inline: false,
                },
                {
                    name: "j!pings show",
                    value: "Shows the topics that will ping you. May only be used in bots-spam-the-ham",
                    inline: true,
                },
                {
                    name: "j!pings rem <topic>",
                    value: "Removes topics from your ping list. May only be used in bots-spam-the-ham",
                    inline: true,
                },
                {
                    name: "j!dance",
                    value: "Does a Kirby dance",
                    inline: false,
                }
            )
            .setFooter({ text: "My name is James!" });
        message.channel.send({ embeds: [helpMenu] });
    } else if (
        message.content.startsWith("j!dance") &&
        (message.channelId == constants.channels.bots ||
            message.channelId == constants.channels.canttalk)
    ) {
        message.channel.send(
            "https://c.tenor.com/XbfcpBquW5oAAAAd/kirby-kirby-dance.gif"
        );
    }
    // Counting
    else if (
        message.content.startsWith("j!count next") &&
        (message.channelId == constants.channels.bots ||
            message.channelId == constants.channels.counting)
    ) {
        // send the next number in counting
        message.channel.send(
            "The next number is: " + parsedStorage.modules.counting.next
        );
    } else if (
        message.content.startsWith("j!count top") &&
        message.channelId == constants.channels.bots
    ) {
        // create the leaderboard messsage
        var leaderboardMessage = "**Counting Leaderboard** \n";
        // find the section: i.e. 1-10, 11-20
        var section = Math.abs(parseInt(message.content.split("top ")[1]));
        if (isNaN(section)) {
            section = 1;
        }

        (async () => {
            if (
                parsedStorage.modules.counting.statistics.length <=
                section * 10 - 9
            ) {
                // Checks if the section is too much
                leaderboardMessage += " No results found here";
            } else {
                for (
                    let i = section * 10 - 10;
                    i <
                    (section * 10 >=
                    parsedStorage.modules.counting.statistics.length
                        ? parsedStorage.modules.counting.statistics.length
                        : section * 10 + 1);
                    i++
                ) {
                    await (async () => {
                        var dispName =
                            parsedStorage.modules.counting.statistics[i].user;
                        await message.guild.members
                            .fetch({ dispName, force: true })
                            .then((collec) => {
                                dispName = collec.get(dispName).displayName;
                                leaderboardMessage +=
                                    i +
                                    1 +
                                    ". " +
                                    dispName +
                                    " " +
                                    parsedStorage.modules.counting.statistics[i]
                                        .score +
                                    "\n";
                            })
                            .catch(() => {});
                    })();
                }
            }
            message.channel.send(leaderboardMessage);
        })();
    } else if (
        message.content.startsWith("j!count rank") &&
        message.channelId == constants.channels.bots
    ) {
        (async () => {
            var user = message.mentions.members.first();
            if (user == undefined) {
                user = message.member;
            }
            message.channel.send(
                "**" +
                    user.displayName +
                    "**\nRank: **" +
                    (parsedStorage.modules.counting.statistics
                        .map((e) => {
                            return e.user;
                        })
                        .indexOf(user.id) +
                        1) +
                    "**\nScore: **" +
                    parsedStorage.modules.counting.statistics[
                        parsedStorage.modules.counting.statistics
                            .map((e) => {
                                return e.user;
                            })
                            .indexOf(user.id)
                    ].score +
                    "**"
            );
        })();
    } else if (
        message.content.startsWith("j!count stats") &&
        message.channelId == constants.channels.bots
    ) {
        var user = message.mentions.members.first();
        if (user == undefined) {
            user = message.member;
        }
        var userIndex = parsedStorage.modules.counting.statistics
            .map((e) => {
                return e.user;
            })
            .indexOf(user.id);

        message.channel.send(
            "**" +
                user.displayName +
                "**\nTimes Counted: **" +
                parsedStorage.modules.counting.statistics[userIndex]
                    .timesCounted +
                "**\nTimes Counted 100: **" +
                parsedStorage.modules.counting.statistics[userIndex]
                    .timesCountedHundred +
                "**\nTimes Counted 69: **" +
                parsedStorage.modules.counting.statistics[userIndex]
                    .timesCountedSixtyNine +
                "**\nTimes Counted 420: **" +
                parsedStorage.modules.counting.statistics[userIndex]
                    .timesCountedFourTwenty +
                "**\nTimes Counted 42: **" +
                parsedStorage.modules.counting.statistics[userIndex]
                    .timesCountedFortyTwo +
                "**\nTimes messed up: **" +
                parsedStorage.modules.counting.statistics[userIndex].errors +
                "**\nScore: **" +
                parsedStorage.modules.counting.statistics[userIndex].score +
                "**"
        );
    }

    fs.writeFileSync("./storage.json", JSON.stringify(parsedStorage, null, '\t'));
};

module.exports = { handle };
