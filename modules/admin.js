const fs = require("fs");

// why not: https://discord.js.org/#/docs/discord.js/
const storage = fs.readFileSync("./storage.json");
const parsedStorage = JSON.parse(storage);

const handle = (message) => {
    if (message.content.startsWith("j@setcount")) {
        var number = message.content.split(" ")[1];
        parsedStorage.modules.counting.next = parseInt(number);
        fs.writeFileSync("./storage.json", JSON.stringify(parsedStorage));
        message.channel.send("Next numb is " + number);
    }
};

module.exports = { handle };
