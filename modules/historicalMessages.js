// why not: https://discord.js.org/#/docs/discord.js/
require("dotenv/config");

// constants
const test = process.env.ARETEST == 1;
const constants = test
    ? require("./../testConstants.json")
    : require("./../constants.json");
const handle = (reaction, MessageEmbed) => {
    (async () => {
        if (reaction.partial) {
            try {
                await reaction.fetch();
                await reaction.message.fetch();
            } catch (error) {
                console.log("f ", error);
            }
        }
        reaction.message.reactions.cache.get("bamboo");
        if (reaction.count > 4) {
            var historicalEmbed = new MessageEmbed()
                .setColor(
                    "#" + Math.floor(Math.random() * 16777215).toString(16)
                )
                .setAuthor({
                    name: reaction.message.author.username,
                    iconURL: reaction.message.author.displayAvatarURL(),
                })
                .addFields({
                    name:
                        reaction.message.content == ""
                            ? "Look, an Image"
                            : reaction.message.content,
                    value:
                        "[Click here to be teleported](" +
                        reaction.message.url +
                        ")",
                });
            // * frog
            if (reaction.message.attachments.size > 0) {
                if (
                    Array.from(
                        reaction.message.attachments.filter((file) => {
                            return (
                                file.url.endsWith(".png") ||
                                file.url.endsWith(".jpg") ||
                                file.url.endsWith(".jpeg") ||
                                file.url.endsWith(".gif")
                            );
                        })
                    ).length > 0
                ) {
                    historicalEmbed.setImage(
                        Array.from(
                            reaction.message.attachments.filter((file) => {
                                return (
                                    file.url.endsWith(".png") ||
                                    file.url.endsWith(".jpg") ||
                                    file.url.endsWith(".jpeg") ||
                                    file.url.endsWith(".gif")
                                );
                            })
                        )[0][1].url
                    );
                }
            }
            reaction.message.guild.channels.cache
                .get(constants.channels.historical)
                .send({ embeds: [historicalEmbed] });
        }
    })();
};

module.exports = { handle };
