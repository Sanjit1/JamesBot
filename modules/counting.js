// why not: https://discord.js.org/#/docs/discord.js/
const math = require("mathjs");
const fs = require("fs");
const { CommandInteractionOptionResolver } = require("discord.js");
var storage = fs.readFileSync("./storage.json");
var parsedStorage = JSON.parse(storage);

var storedNumber;
var mostRecentUser = "";

const handle = (message) => {
    var num;
    try {
        num =
            typeof math.evaluate(message.content) == "number"
                ? math.evaluate(message.content)
                : "hm";
    } catch {
        num = "hm";
    }

    storage = fs.readFileSync("./storage.json");
    parsedStorage = JSON.parse(storage);

    if (
        num == parsedStorage.modules.counting.next &&
        message.author.id != mostRecentUser
    ) {
        parsedStorage.modules.counting.next++;
        if (num % 100 == 0) {
            message.react("💯");
        }
        message.react("☑️");
        mostRecentUser = message.author.id;
    } else if (!isNaN(num)) {
        message.react("❎");

        // handles the subtraction of the number
        if (parsedStorage.modules.counting.next <= 1) {
            parsedStorage.modules.counting.next = 1;
            mostRecentUser = "";
        } else {
            storedNumber = parsedStorage.modules.counting.next;
            parsedStorage.modules.counting.next = storedNumber - (Math.floor(
                ((6900/(1 + math.e**(-0.00005*(storedNumber - 0)))) + (math.e**(storedNumber/69420)) +
                0.02*storedNumber + math.log10(3*storedNumber) - 3452) / 1.15 + storedNumber**0.4
            ));
        }
                
        if (mostRecentUser == message.author.id) {
            message.channel.send("You can't count twice in a row!");
        }
        var last =
            mostRecentUser == ""
                ? "the FROG"
                : message.guild.members.cache.get(mostRecentUser).user.username;
        message.channel.send(
            "<@" +
                message.author.id +
                ">" +
                " sucks. " +
                "The next number is: " +
                parsedStorage.modules.counting.next +
                ". Make sure " +
                last +
                " doesn't count the next count."
        );
    }
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

    if (!isNaN(num) && parsedStorage.modules.counting.next == num + 1) {
        message.channel.send(
            "<@" +
                message.author.id +
                ">" +
                " sucks, they edited their count of " +
                num +
                ". " +
                "The next number is: " +
                parsedStorage.modules.counting.next
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

    if (!isNaN(num) && parsedStorage.modules.counting.next == num + 1) {
        message.channel.send(
            "<@" +
                message.author.id +
                ">" +
                " sucks, they edited their count of " +
                num +
                ". " +
                "The next number is: " +
                parsedStorage.modules.counting.next
        );
    }
};

module.exports = { handle, handleDel, handleEdit };
