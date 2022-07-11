// why not: https://discord.js.org/#/docs/discord.js/
const fs = require("fs");
var storage = fs.readFileSync("./storage.json");
var parsedStorage = JSON.parse(storage);
const { Client, Intents, MessageEmbed } = require("discord.js");

const handle = (message) => {
    update();
    parsedStorage = JSON.parse(storage);
    var filter = /[a-zA-Z0-9 -!@#$% ^&*:;,.~+-=]/gm; // Filter out some characters
    Object.keys(parsedStorage.modules.pings.users).forEach((element) => {
        parsedStorage.modules.pings.users[element].forEach((topic) => {
            simplified = (message.content.match(filter) || [])
                .join("")
                .toLowerCase();
            if (
                simplified.split(" ").includes(topic) ||
                simplified.replace(".", "").split(" ").includes(topic) ||
                simplified.replace(",", "").split(" ").includes(topic) ||
                simplified.replace('"', "").split(" ").includes(topic) ||
                simplified.replace("'", "").split(" ").includes(topic)
            ) {
                message.guild.members
                    .fetch({ element, force: true })
                    .then((collec) => {
                        var toPing = collec.get(element);
                        if (
                            message.author.id != element &&
                            message.channel
                                .permissionsFor(element)
                                .has("READ_MESSAGE_HISTORY")
                        ) {
                            var pingEmbed = new MessageEmbed()
                                .setColor(
                                    "#" +
                                        Math.floor(
                                            Math.random() * 16777215
                                        ).toString(16)
                                ) // set a random color cuz why not
                                .setAuthor({
                                    name: message.author.username,
                                    iconURL: message.author.displayAvatarURL(),
                                }) // show the author of the original message on the embed
                                .addFields(
                                    {
                                        name: "Topic `" + topic + "` found",
                                        value:
                                            "[Click here to be teleported](" +
                                            message.url +
                                            ")",
                                        inline: true,
                                    },
                                    {
                                        name: "Content",
                                        value: simplified,
                                        inline: true,
                                    },
                                    {
                                        name: "Unsubscribe?",
                                        value:
                                            "type `j!pings rem " +
                                            topic +
                                            "` in the bots channel",
                                        inline: true,
                                    }
                                ); // add the message content to the historical message embed
                            toPing
                                .send({ embeds: [pingEmbed] })
                                .catch(() => {});
                        }
                    })
                    .catch(() => {
                        //remove later
                        update();
                        delete parsedStorage.modules.pings.users[element];
                        fs.writeFileSync(
                            "./storage.json",
                            JSON.stringify(parsedStorage, null, "\t")
                        );
                    });
            }
        });
    });
};

const update = () => {
    storage = fs.readFileSync("./storage.json");
    parsedStorage = JSON.parse(storage);
};

const commands = (message) => {
    update();
    if (message.content.startsWith("j!pings add")) {
        var filter = /[a-zA-Z0-9 -!@#$%^&*:;,.~+-=]/gm; // Filter out some characters
        if (message.content.split("j!pings add ")[1] != undefined) {
            var topic = (
                message.content.split("j!pings add ")[1].match(filter) || []
            )
                .join("")
                .toLowerCase();

            if (
                typeof parsedStorage.modules.pings.users[message.author.id] ==
                "undefined"
            ) {
                parsedStorage.modules.pings.users[message.author.id] = [];
            }
            if (
                !parsedStorage.modules.pings.users[message.author.id].includes(
                    topic
                )
            ) {
                parsedStorage.modules.pings.users[message.author.id].push(
                    topic
                );
                message.channel.send("Added `" + topic + "` to your ping list");
            } else {
                message.channel.send("Topic already in ping list!");
            }
        } else {
            message.channel.send("Smh. Gimme a topic");
        }
    } else if (message.content.startsWith("j!pings show")) {
        if (
            parsedStorage.modules.pings.users.hasOwnProperty(
                message.author.id
            ) &&
            parsedStorage.modules.pings.users.hasOwnProperty(message.author.id)
                .length > 0
        ) {
            message.channel.send(
                "You are currently subscribed to `" +
                    parsedStorage.modules.pings.users[message.author.id].join(
                        "` `"
                    ) +
                    "`"
            );
        } else {
            message.channel.send(
                "You are not subscribed to anything(yet!). Use `j!pings` to see how to subscribe to topic pings."
            );
        }
    } else if (
        message.content.startsWith("j!pings del") ||
        message.content.startsWith("j!pings rem") ||
        message.content.startsWith("j!pings delete") ||
        message.content.startsWith("j!pings remove")
    ) {
        var filter = /[a-zA-Z0-9 -!@#$%^&*:;,.~+-=]/gm; // Filter out some characters
        function removeTopic(topic) {
            if (
                !parsedStorage.modules.pings.users[message.author.id].includes(
                    topic
                )
            ) {
                message.channel.send(
                    "Could not find `" + topic + "` in your pings"
                );
            } else {
                parsedStorage.modules.pings.users[message.author.id] =
                    parsedStorage.modules.pings.users[message.author.id].filter(
                        (t) => t != topic
                    );
                message.channel.send("Removed `" + topic + "` from your pings");
            }
        }
        if (message.content.split("j!pings del ")[1] != undefined) {
            removeTopic(
                (message.content.split("j!pings del ")[1].match(filter) || [])
                    .join("")
                    .toLowerCase()
            );
        } else if (message.content.split("j!pings rem ")[1] != undefined) {
            removeTopic(
                (message.content.split("j!pings rem ")[1].match(filter) || [])
                    .join("")
                    .toLowerCase()
            );
        } else if (message.content.split("j!pings delete ")[1] != undefined) {
            removeTopic(
                (
                    message.content.split("j!pings delete ")[1].match(filter) ||
                    []
                )
                    .join("")
                    .toLowerCase()
            );
        } else if (message.content.split("j!pings remove ")[1] != undefined) {
            removeTopic(
                (
                    message.content.split("j!pings remove ")[1].match(filter) ||
                    []
                )
                    .join("")
                    .toLowerCase()
            );
        } else {
            message.channel.send("Smh. Gimme a topic");
        }
    } else {
        var helpMenu = new MessageEmbed()
            .setColor("#decaf5")
            .setTitle("Topic Pings")
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL(),
            })
            .addFields(
                {
                    name: "j!pings help",
                    value: "Brings up this help menu.",
                    inline: true,
                },
                {
                    name: "j!pings add <topic>",
                    value: "Adds <topic> to your ping lists, and no the <>'s are not needed.",
                    inline: true,
                },
                {
                    name: "j!pings rem <topic>",
                    value: "Deletes <topic> from your ping lists, and no the <>'s are not needed",
                    inline: true,
                },
                {
                    name: "j!pings show",
                    value: "Shows all the topics you are subscribed to.",
                    inline: true,
                }
            );
        message.channel.send({ embeds: [helpMenu] });
    }
    fs.writeFileSync(
        "./storage.json",
        JSON.stringify(parsedStorage, null, "\t")
    );
};

module.exports = { handle, commands };
