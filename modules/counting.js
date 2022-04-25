// why not: https://discord.js.org/#/docs/discord.js/
const math = require("mathjs");
const fs = require("fs");
const storage = fs.readFileSync("./storage.json");
const parsedStorage = JSON.parse(storage);

var currentCount = parsedStorage.modules.counting.next;
var mostRecentUser = "";

const handle = (message) => {
    currentCount = parsedStorage.modules.counting.next;
    var num;
    try {
        num =
            typeof math.evaluate(message.content) == "number"
                ? math.evaluate(message.content)
                : "hm";
    } catch {
        num = "hm";
    }

    if (num == currentCount && message.author.id != mostRecentUser) {
        currentCount++;
        if (num % 100 == 0) {
            message.react("💯");
        }
        message.react("☑️");
        mostRecentUser = message.author.id;
    } else if (!isNaN(num)) {
        message.react("❎");
        if (currentCount <= 1) {
            currentCount = 1;
            mostRecentUser = "";
        } else if (currentCount <= 50) {
            currentCount = currentCount - 1;
        } else if (currentCount <= 100) {
            currentCount = Math.floor(currentCount * 0.95);
        } else {
            currentCount = Math.floor(currentCount * 0.9);
        }
        if (mostRecentUser == message.author.id) {
            message.channel.send("You can't count twice in a row!");
        }
        message.channel.send(
            "<@" +
                message.author.id +
                ">" +
                " sucks. " +
                "The next number is: " +
                currentCount
        );
    }
    parsedStorage.modules.counting.next = currentCount;
    fs.writeFileSync("./storage.json", JSON.stringify(parsedStorage));
};

const handleDel = (message) => {
    var num;
    try {
        num =
            typeof math.evaluate(message.content) == "number"
                ? math.evaluate(message.content)
                : "hm";
    } catch {
        num = "hm";
    }

    if (!isNaN(num) && currentCount == num + 1) {
        message.channel.send(
            "<@" +
                message.author.id +
                ">" +
                " sucks, they edited their count of " +
                num +
                ". " +
                "The next number is: " +
                currentCount
        );
    }
};

const handleEdit = (oldMessage, newMessage) => {
    var num;
    try {
        num =
            typeof math.evaluate(oldMessage.content) == "number"
                ? math.evaluate(oldMessage.content)
                : "hm";
    } catch {
        num = "hm";
    }

    if (!isNaN(num) && currentCount == num + 1) {
        message.channel.send(
            "<@" +
                message.author.id +
                ">" +
                " sucks, they edited their count of " +
                num +
                ". " +
                "The next number is: " +
                currentCount
        );
    }
};

module.exports = { handle, handleDel, handleEdit };
