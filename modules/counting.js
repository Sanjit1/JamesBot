// why not: https://discord.js.org/#/docs/discord.js/
/*
    Counting module: Feature tracker
    Tracks four cases as laid in lines 43-47
    Reacts to messages: Valid get ticks, Invalid get Crosses, special cases get special reacts
    Scoreboard and rankings
*/

const math = require("mathjs");
const fs = require("fs");
var storage = fs.readFileSync("./storage.json");
var parsedStorage = JSON.parse(storage);

var storedNumber;
var mostRecentUser = "";
var cashedTimestamp = 0;

// determines if message is a number
function evaluateMessage(Messagecontent) {
    var numberCounter;
    try {
        numberCounter =
            typeof math.evaluate(Messagecontent) == "number"
                ? math.evaluate(Messagecontent)
                : "hm";
    } catch {
        nummberCounter = "hm";
    }
    return numberCounter;
}
const handle = (message) => {
    // sets the elapsed time between messages
    var elapsedtime = math.abs(message.createdTimestamp - cashedTimestamp);
    var num = evaluateMessage(message.content);
    // reads in the storage json holding the current count
    storage = fs.readFileSync("./storage.json");
    parsedStorage = JSON.parse(storage);

    // Checks if the most recent message was sent by the last person to count correctly
    /*
        Four cases:
        C1: Valid Count: evaluateMessage will return valid count and count will increase
        C2: Synchronous Count: Two Valid Counts with low margin of time, i.e. counting at the same time: the wrong counts will be deleted and the count moves forward
        C3: Invalid Count: The wrong number is counted. Count moves back by a bit
        C4: Counting in a row: Same user counts multiple times. Count moves back by a bit.
        Case 3 is implemented within Case 4
    */
    var userIndex = parsedStorage.modules.counting.statistics
        .map((e) => {
            return e.user;
        })
        .indexOf(message.author.id);
    if (userIndex < 0) {
        parsedStorage.modules.counting.statistics.push({
            user: message.author.id,
            timesCounted: 0,
            timesCountedHundred: 0,
            timesCountedSixtyNine: 0,
            timesCountedFourTwenty: 0,
            timesCountedFortyTwo: 0,
            errors: 0,
            score: 0,
        });
        userIndex = parsedStorage.modules.counting.statistics.length - 1;
    }

    var userStats = parsedStorage.modules.counting.statistics[userIndex];
    if (
        num == parsedStorage.modules.counting.next &&
        message.author.id != mostRecentUser
    ) {
        userStats.timesCounted++;
        // adds emoji reactions to correct counts
        if (num % 100 == 0) {
            userStats.timesCountedHundred++;
            message.react("💯");
        } else if (num % 100 == 69) {
            userStats.timesCountedSixtyNine++;
            message.react("🇳");
            message.react("🇮");
            message.react("🇨");
            message.react("🇪");
            //message.react("<:69:976918710235312248>");
        } else if (num % 1000 == 420) {
            userStats.timesCountedFourTwenty++;
            message.react("🅱️");
            message.react("🇱");
            message.react("🅰️");
            message.react("🇿");
            message.react("🇪");
            message.react("🍃");
            message.react("🇮");
            message.react("🇹");
        } else if (num % 100 == 42) {
            userStats.timesCountedFortyTwo++;
            message.react("🅰️");
            message.react("🇳");
            message.react("🇸");
            message.react("🇼");
            message.react("🇪");
            message.react("🇷");
        }

        parsedStorage.modules.counting.next++;
        message.react("☑️");
        mostRecentUser = message.author.id;
        cashedTimestamp = message.createdTimestamp;

        // looks for if the time between messages was less than x in milliseconds
        // message.channel.send("delta time: " + elapsedtime);
    } else if (
        num == parsedStorage.modules.counting.next - 1 &&
        message.author.id != mostRecentUser &&
        elapsedtime <= 690
    ) {
        // finds last user
        var last =
            mostRecentUser == ""
                ? "the FROG"
                : message.guild.members.cache.get(mostRecentUser).user.username;
        // message sent to channel
        message.channel.send(
            "<@" +
                message.author.id +
                ">" +
                " Is alright, they were only " +
                elapsedtime +
                " milliseconds behind the last person. It was close, but this bot will allow the count to continue " +
                "The next number is: " +
                parsedStorage.modules.counting.next +
                ". Make sure " +
                last +
                " doesn't count the next count."
        );
        message.delete();
        // checks if the message is a number
    } else if (!isNaN(num)) {
        message.react("❎");
        userStats.errors++;
        // handles the subtraction of the number
        // checks if number is less than 1 and sets it to one
        if (parsedStorage.modules.counting.next <= 1) {
            parsedStorage.modules.counting.next = 1;
            mostRecentUser = "";
        } else {
            // subtracts a value based on an equation
            storedNumber = parsedStorage.modules.counting.next;
            parsedStorage.modules.counting.next =
                storedNumber -
                Math.floor(
                    (6900 / (1 + math.e ** (-0.00005 * (storedNumber - 0))) +
                        math.e ** (storedNumber / 69420) +
                        0.02 * storedNumber +
                        math.log10(3 * storedNumber) -
                        3452) /
                        1.15 +
                        storedNumber ** 0.4
                );
        }
        // checks if someone counted twice in a row, Case 3
        if (mostRecentUser == message.author.id) {
            message.channel.send("You can't count twice in a row!");
        }
        // sends a message if someone counted twice in a row
        var last =
            mostRecentUser == ""
                ? "the FROG"
                : message.guild.members.cache.get(mostRecentUser).user.username;
        message.channel.send(
            "<@" +
                message.author.id +
                ">" +
                " sucks. You have messed up " +
                userStats.errors +
                " times. The next number is: " +
                parsedStorage.modules.counting.next +
                ". Make sure " +
                last +
                " doesn't count the next count."
        );
    }
    // writes the new count to storage
    // Update score and ranking
    userStats.score =
        userStats.timesCounted * 10 +
        userStats.timesCountedHundred * 100 +
        userStats.timesCountedSixtyNine * 69 +
        userStats.timesCountedFourTwenty * 420 +
        userStats.timesCountedFortyTwo * 42 -
        Math.floor(userStats.errors * 25 + (1 + userStats.errors ** 2) / 10);

    parsedStorage.modules.counting.statistics[userIndex] == userStats;

    fs.writeFileSync("./storage.json", JSON.stringify(parsedStorage));
};

// handles when people delete their messages
const handleDel = (message) => {
    var num;
    num = evaluateMessage(message.content);
    // sends message if last person to count deleted their message
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

// handles when people edit their message
const handleEdit = (oldMessage, newMessage) => {
    var num;
    num = evaluateMessage(oldMessage.content);

    // sends message if last person edited their count
    if (!isNaN(num) && parsedStorage.modules.counting.next == num + 1) {
        oldMessage.channel.send(
            "<@" +
                oldMessage.author.id +
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
