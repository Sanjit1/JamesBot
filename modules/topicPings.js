// why not: https://discord.js.org/#/docs/discord.js/
const fs = require("fs");
var storage = fs.readFileSync("./storage.json");
var parsedStorage = JSON.parse(storage);
const onCoolDown = new Set();

const handle = (message, MessageEmbed) => {
    parsedStorage = JSON.parse(storage);
    var filter = /[a-zA-Z0-9 -!@#$% ^&*:;,.~+-=]/gm; // Filter out some characters
    Object.keys(parsedStorage.modules.pings.users).forEach((element) => {
        if (
            message.author.id != element &&
            !onCoolDown.has(element) &&
            message.channel.permissionsFor(element).has("READ_MESSAGE_HISTORY")
        ) {
            parsedStorage.modules.pings.users[element].forEach((topic) => {
                simplified = (message.content.match(filter) || []).join("");
                if (
                    simplified.split(" ").includes(topic) ||
                    simplified.replace(".", "").split(" ").includes(topic) ||
                    simplified.replace(",", "").split(" ").includes(topic) ||
                    simplified.replace('"', "").split(" ").includes(topic) ||
                    simplified.replace("'", "").split(" ").includes(topic)
                ) {
                    var pingEmbed = new MessageEmbed()
                        .setColor(
                            "#" +
                                Math.floor(Math.random() * 16777215).toString(
                                    16
                                )
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

                    message.author
                        .send({ embeds: [pingEmbed] })
                        .catch(() => {});
                    wrapper = message.author.id;
                    onCoolDown.add(wrapper);
                    setTimeout(() => {
                        onCoolDown.delete(wrapper);
                    }, 1 * 1000 * 3);
                }
            });
        }
    });
};

module.exports = { handle };
