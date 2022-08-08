// why not: https://discord.js.org/#/docs/discord.js/

const handle = (message) => {
    if (message.type === "GUILD_MEMBER_JOIN") {
        message.react("👋");
    }
};

const check = () => {
    // Check peoples birthdays.
};

module.exports = { handle, check };
