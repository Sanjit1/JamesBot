const fs = require("fs");

// why not: https://discord.js.org/#/docs/discord.js/
const storage = fs.readFileSync("./storage.json");
const parsedStorage = JSON.parse(storage);
require("dotenv/config");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");

// constants
const test = process.env.ARETEST == 1;
const constants = test
    ? require("./../testConstants.json")
    : require("./../constants.json");

const handle = (message) => {
    if (message.content.startsWith("j.setcount")) {
        var number = message.content.split(" ")[1];
        parsedStorage.modules.counting.next = parseInt(number);
        fs.writeFileSync(
            "./storage.json",
            JSON.stringify(parsedStorage, null, "\t")
        );
        message.channel.send("Next numb is **" + number + "**.");
    } else if (message.content.startsWith("j.storage")) {
        if (message.channelId == constants.channels.james) {
            // Do stuff
            message.channel.send("Storage", { files: ["./storage.json"] });
            // Send message action thingie

            const menu = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setPlaceholder("")
                    .setCustomId("storage")
                    .addOptions([
                        {
                            label: "Topic Pings",
                            description: "The topic pings Module",
                            value: "pings",
                        },
                        {
                            label: "Counting",
                            description: "The Counting Module",
                            value: "counting",
                        },
                        {
                            label: "Historical Messages",
                            description: "The Historical Messages Module",
                            value: "historical",
                        },
                    ])
            );

            message.reply({ content: "More James", components: [menu] });
        } else {
            message.channel.send(
                "Don't be lazy, go to <#" + constants.channels.james + ">"
            );
        }
    }
};

module.exports = { handle };
