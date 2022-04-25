// why not: https://discord.js.org/#/docs/discord.js/

const { Message } = require("discord.js");

const handleReaction = (messageReaction, user, sanjit) => {
    if (user.id == sanjit && messageReaction.emoji.name == "🔱") {
        var msg;
        if (messageReaction.message.partial) {
            messageReaction.message.fetch().then((fullMessage) => {
                msg =
                    "Question of the day! Make sure to add your questions to <#" +
                    fullMessage.channelId +
                    "> and star the ones you like \n. \n. \n. \n" +
                    "<@" +
                    fullMessage.author.id +
                    ">" +
                    " asks " +
                    fullMessage.content;
                messageReaction.message.channel.parent.send(msg);
            });
        } else {
            msg =
                "Question of the day! Make sure to add your questions to <#" +
                messageReaction.message.channelId +
                "> and star the ones you like \n. \n. \n. " +
                "<@" +
                messageReaction.message.author.id +
                ">" +
                " asks " +
                messageReaction.message.content;
            messageReaction.message.channel.parent.send(msg);
        }
    }
};

module.exports = { handleReaction };
