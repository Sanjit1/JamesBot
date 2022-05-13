// why not: https://discord.js.org/#/docs/discord.js/
const math = require("mathjs");
const fs = require("fs");
const { CommandInteractionOptionResolver } = require("discord.js");
var storage = fs.readFileSync("./storage.json");
var parsedStorage = JSON.parse(storage);

var storedNumber;
var mostRecentUser = "";

// Initilizes an array of people who messup and how many times they mess up
// Should be in the format person.id:1 then use .split(:) to get info
var failsInCounting = [];

// determines if message is a number
function evauluateIfMessageIsNumber(Messagecontent){
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
    var num;
    num = evauluateIfMessageIsNumber(message.content)
    // reads in the storage json holding the current count
    storage = fs.readFileSync("./storage.json");
    parsedStorage = JSON.parse(storage);

    // Checks if the most recent message was sent by the last person to count correctly
    if (
        num == parsedStorage.modules.counting.next &&
        message.author.id != mostRecentUser
    ) { // adds emoji reactions to correct counts
        parsedStorage.modules.counting.next++;
        if (num % 100 == 0) {
            message.react("💯");
        }
        message.react("☑️");
        mostRecentUser = message.author.id;
    // checks if the message is a number
    } else if (!isNaN(num)) {
        message.react("❎");

        // sets the arrat fails in counting to have the array stored in the storage.json file
        failsInCounting = parsedStorage.modules.counting.failTracker;


        // uses: https://www.w3schools.com/js/js_arrays.asp
        var indexOfName;
        var numberOfScrewUps;
        var isTheIdContained = false;

        // checks if the person who failed is already in the database
        failsInCounting.forEach(element =>{
            var splitElement = element.split(":");
            if(splitElement[0] == message.author.id){
            isTheIdContained = true;
            }
        });
        
        // gives conditions based on if id was found
        if(isTheIdContained){
            var iterableForCounting = 0;
            failsInCounting.forEach(element => {
                var splitFailsInCounting = element.split(":");
                if(message.author.id == splitFailsInCounting[0]){
                    indexOfName = iterableForCounting;
                    numberOfScrewUps = splitFailsInCounting[1];
                    numberOfScrewUps ++;
                }
                iterableForCounting ++;
            });
            // pushes new number of screw ups to storage
            failsInCounting[indexOfName] = message.author.id + ":" + numberOfScrewUps;
        }else{
            // adds user to data base because it didn't find their user id
            failsInCounting.push(message.author.id + ":" + 1);
            numberOfScrewUps = 1;
        }

        // pushes updates to the actual storage json
        parsedStorage.modules.counting.failTracker = failsInCounting;

        // handles the subtraction of the number
        // checks if number is less than 1 and sets it to one
        if (parsedStorage.modules.counting.next <= 1) {
            parsedStorage.modules.counting.next = 1;
            mostRecentUser = "";
        } else { // subtracts a  value for a failer based on an equation
            storedNumber = parsedStorage.modules.counting.next;
            parsedStorage.modules.counting.next = storedNumber - (Math.floor(
                ((6900/(1 + math.e**(-0.00005*(storedNumber - 0)))) + (math.e**(storedNumber/69420)) +
                0.02*storedNumber + math.log10(3*storedNumber) - 3452) / 1.15 + storedNumber**0.4
            ));
        }
        // checks if someone counted twice in a row            
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
                " sucks. " +
                "They have screwed up " +
                numberOfScrewUps + 
                " times. " +
                "The next number is: " +
                parsedStorage.modules.counting.next +
                ". Make sure " +
                last +
                " doesn't count the next count."
        );
    }
    // writes the new count to storage
    fs.writeFileSync("./storage.json", JSON.stringify(parsedStorage));
};

// handles when people delete their messages
const handleDel = (message) => {
    var num;
    num = evauluateIfMessageIsNumber(message.content)
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
    num = evauluateIfMessageIsNumber(oldMessage.content)

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