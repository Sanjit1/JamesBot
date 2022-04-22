// why not: https://discord.js.org/#/docs/discord.js/

var currentCount = 1;
var mostRecentUser = "";

const handle = (message) => {
    if ((message.content == (currentCount)) && (message.author.id != mostRecentUser)){
        currentCount ++;
        message.react("☑️");
        mostRecentUser = message.author.id
    }else if(!isNaN(message.content)){
        message.react("❎");
        if (currentCount <= 1){
            currentCount = 1
            mostRecentUser = ""
        }else if(currentCount <= 50){
            currentCount = currentCount - 1
        }else if(currentCount <= 100){
            currentCount = Math.floor(currentCount * .95)
        }else{
            currentCount = Math.floor(currentCount * .9)
        }
        if (mostRecentUser == message.author.id){
            message.channel.send("You can't count twice in a row!")
        }
        message.channel.send("<@" + message.author.id + ">" + " sucks. " + "The next number is: " + (currentCount))
    }
}; 

module.exports = { handle };
