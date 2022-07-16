const fs = require("fs");

// why not: https://discord.js.org/#/docs/discord.js/
var storage = fs.readFileSync("./storage.json");
var parsedStorage = JSON.parse(storage);
require("dotenv/config");
const {
    MessageActionRow,
    Modal,
    TextInputComponent,
    MessageButton,
    MessageAttachment,
} = require("discord.js");

// constants
const test = process.env.ARETEST == 1;
const constants = test
    ? require("./../testConstants.json")
    : require("./../constants.json");

const handle = (message) => {
    storage = fs.readFileSync("./storage.json");
    parsedStorage = JSON.parse(storage);

    if (message.content.startsWith("j.set count")) {
        var number = message.content.split(" ")[1];
        parsedStorage.modules.counting.next = parseInt(number);
        fs.writeFileSync(
            "./storage.json",
            JSON.stringify(parsedStorage, null, "\t")
        );
        message.channel.send("Next numb is **" + number + "**.");
    } else if (message.content.startsWith("j.storage")) {
        if (message.channelId == constants.channels.james) {
            if (message.content.split(" ").length > 1) {
                // Parse the file
                data = message.content
                    .split(" ")
                    .splice(1)
                    .join(" ")
                    .split(".")
                    .reduce((o, k) => {
                        return o && o[k];
                    }, parsedStorage);

                if (data == undefined) {
                    message.channel.send(
                        "Could not find path Storage." +
                            message.content.split(" ").splice(1).join(" ")
                    );
                } else {
                    if (JSON.stringify(data, null, "\t").length > 2000 - 10) {
                        var storageToSend = new MessageAttachment(
                            Buffer.from(
                                JSON.stringify(data, null, "\t"),
                                "utf-8"
                            ),
                            "storage.json"
                        );
                        var properties = "";
                        if (Array.isArray(data)) {
                            properties += "Array Length = " + data.length;
                        } else {
                            properties += Object.keys(data).join(", ");
                        }

                        message.channel.send({
                            content:
                                "`Storage." +
                                message.content.split(" ").splice(1).join(" ") +
                                "`\n**Properties**: " +
                                properties,
                            files: [storageToSend],
                        });
                    } else {
                        message.channel.send(
                            "Storage." +
                                message.content.split(" ").splice(1).join(" ")
                        );
                        message.channel.send(
                            "```\n" + JSON.stringify(data, null, "\t") + "\n```"
                        );
                    }
                }
            } else {
                // Do stuff
                var storageToSend = new MessageAttachment(
                    Buffer.from(
                        JSON.stringify(parsedStorage, null, "\t"),
                        "utf-8"
                    ),
                    "storage.json"
                );

                message.channel.send({
                    content: "Storage",
                    files: [storageToSend],
                });
            }
        } else {
            message.channel.send(
                "Don't be lazy, go to <#" + constants.channels.james + ">"
            );
        }
    } else if (message.content.startsWith("j.setstorage")) {
        if (message.channelId == constants.channels.james) {
            if (message.content.split(" ").length > 1) {
                // Parse the file
                data = message.content
                    .split(" ")
                    .splice(1)
                    .join(" ")
                    .split(".")
                    .reduce((o, k) => {
                        return o && o[k];
                    }, parsedStorage);

                if (data == undefined) {
                    message.channel.send(
                        "Could not find path Storage." +
                            message.content.split(" ").splice(1).join(" ")
                    );
                } else {
                    if (JSON.stringify(data, null, "\t").length > 2000 - 10) {
                        var storageToSend = new MessageAttachment(
                            Buffer.from(
                                JSON.stringify(data, null, "\t"),
                                "utf-8"
                            ),
                            "storage.json"
                        );
                        var properties = "";
                        if (Array.isArray(data)) {
                            properties += "Array Length = " + data.length;
                        } else {
                            properties += Object.keys(data).join(", ");
                        }

                        message.channel.send({
                            content:
                                "`Storage." +
                                message.content.split(" ").splice(1).join(" ") +
                                "`\n**Properties**: " +
                                properties,
                            files: [storageToSend],
                        });
                    } else {
                        message.channel.send(
                            "Storage." +
                                message.content.split(" ").splice(1).join(" ")
                        );
                        message.channel.send(
                            "```\n" + JSON.stringify(data, null, "\t") + "\n```"
                        );
                    }

                    // Create a modal to do stuff
                    if (
                        "Storage." +
                            message.content.split(" ").splice(1).join(" ") >
                        95
                    ) {
                        message.channel.send(
                            "Path has too many characters, try using a smaller path"
                        );
                    } else {
                        const row = new MessageActionRow().addComponents(
                            new MessageButton()
                                .setCustomId(
                                    "Storage." +
                                        message.content
                                            .split(" ")
                                            .splice(1)
                                            .join(" ")
                                )
                                .setLabel("Click here to change")
                                .setStyle("PRIMARY")
                        );

                        message.reply({ components: [row] });
                    }
                }
            } else {
                // Do stuff
                var storageToSend = new MessageAttachment(
                    Buffer.from(
                        JSON.stringify(parsedStorage, null, "\t"),
                        "utf-8"
                    ),
                    "storage.json"
                );

                message.channel.send({
                    content: "Storage",
                    files: [storageToSend],
                });
            }
        } else {
            message.channel.send(
                "Don't be lazy, go to <#" + constants.channels.james + ">"
            );
        }
    }
};

const interactionCreate = (interaction) => {
    storage = fs.readFileSync("./storage.json");
    parsedStorage = JSON.parse(storage);
    if (interaction.isButton() && interaction.customId.startsWith("Storage.")) {
        const modal = new Modal()
            .setCustomId(interaction.customId)
            .setTitle("Edit Storage");
        const storageInput = new TextInputComponent()
            .setCustomId(interaction.customId)
            .setLabel(interaction.customId.split(".").slice(-3).join("."))
            .setStyle("PARAGRAPH");
        const actionRow = new MessageActionRow().addComponents(storageInput);
        modal.addComponents(actionRow);
        interaction.showModal(modal);
    } else if (
        interaction.type == "MODAL_SUBMIT" &&
        interaction.customId.startsWith("Storage.")
    ) {
        var o = parsedStorage;
        path = interaction.customId.split(".").splice(1);
        last = path.pop();
        path.forEach((p) => {
            o = o[p];
        });
        o[last] = eval(
            "(" +
                interaction.fields.getTextInputValue(interaction.customId) +
                ")"
        );
        interaction.reply({ content: "Ight lit" });
    }
    fs.writeFileSync(
        "./storage.json",
        JSON.stringify(parsedStorage, null, "\t")
    );
};

module.exports = { handle, interactionCreate };
