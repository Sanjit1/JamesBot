// why not: https://discord.js.org/#/docs/discord.js/

const fs = require("fs");
var storage = fs.readFileSync("./storage.json");
var parsedStorage = JSON.parse(storage);

const moment = require("moment");

require("dotenv/config");

// constants
const test = process.env.ARETEST == 1;
const constants = test
    ? require("./../testConstants.json")
    : require("./../constants.json");

var filter = /[a-zA-Z0-9 -!@#$%^&*:;,.~+-=]/gm; // Filter out some characters

function embedEvent(eventProps, member, eventDate) {
    return new MessageEmbed()
        .setColor("#decaf5")
        .setTitle(eventProps.id + ". " + eventProps.name)
        .setAuthor({
            name: member.displayName,
            iconURL: member.displayAvatarURL(),
        })
        .setDescription(eventProps.description)
        .addFields(
            {
                name: moment(eventDate).format("dddd, MMMM Do [at] h:mm A"),
                value: "*at* " + eventProps.location,
                inline: false,
            },
            {
                name: "RSVP List",
                value:
                    "*" + Object.values(eventProps.rsvplist).join("*, *") + "*",
                inline: false,
            }
        )
        .setFooter({
            text:
                "Use `j!events show " + eventProps.id + "` to show this event.",
        });
}

const {
    MessageActionRow,
    Modal,
    TextInputComponent,
    MessageButton,
    MessageEmbed,
} = require("discord.js");

const commands = (message) => {
    try {
        if (message.content.startsWith("j!events create")) {
            // Create an embed to detail the process.
            const eventBuilderEmbed = new MessageEmbed()
                .setColor("#decaf5")
                .setTitle("Event Builder: PLEASE READ")
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setDescription("Event Builder help")
                .addFields(
                    {
                        name: "How to use this builder",
                        value: "To use this builder click the button below this message. The builder will ask for a few details about your event.",
                        inline: false,
                    },
                    {
                        name: "Name",
                        value: "This is the name of your event. Keep this shorter than 75 characters.",
                        inline: false,
                    },
                    {
                        name: "Description",
                        value: "Describe your event with as many details as you can. Be specific. Use up to 4000 characters.",
                        inline: false,
                    },
                    {
                        name: "Date",
                        value: "Enter the date of your event. Use the MM/DD/YY format. Ex: 04/12/22",
                        inline: false,
                    },
                    {
                        name: "Time",
                        value: "Enter the time of your event. Use the 24H format. Ex: 16:05, 00:12",
                        inline: false,
                    },
                    {
                        name: "Location",
                        value: "Where is your event taking place?",
                        inline: false,
                    }
                )
                .setFooter({ text: "My name is James!" });
            const createRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId(message.author.id + "eventsstart" + message.id)
                    .setLabel("Create Event")
                    .setStyle("PRIMARY")
            );

            message.channel.send({
                components: [createRow],
                embeds: [eventBuilderEmbed],
            });
        } else if (message.content.startsWith("j!events edit ")) {
            var eventId = message.content
                .split("j!events edit ")[1]
                .toUpperCase();
            eventProps = parsedStorage.modules.events.list[eventId];
            if (typeof eventProps == "undefined") {
                message.reply({ content: "Event not found!", ephemeral: true });
            } else if (message.author.id != eventProps.organizer) {
                message.reply({
                    content:
                        "You need to be the organizer of the event to edit it.",
                    ephemeral: true,
                });
            } else {
                const editRow = new MessageActionRow().addComponents([
                    new MessageButton()
                        .setCustomId("eventsedit " + eventId + " name")
                        .setLabel("Name")
                        .setStyle("PRIMARY"),
                    new MessageButton()
                        .setCustomId("eventsedit " + eventId + " description")
                        .setLabel("Description")
                        .setStyle("PRIMARY"),
                    new MessageButton()
                        .setCustomId("eventsedit " + eventId + " date")
                        .setLabel("Date")
                        .setStyle("PRIMARY"),
                    new MessageButton()
                        .setCustomId("eventsedit " + eventId + " time")
                        .setLabel("Time")
                        .setStyle("PRIMARY"),
                    new MessageButton()
                        .setCustomId("eventsedit " + eventId + " location")
                        .setLabel("Location")
                        .setStyle("PRIMARY"),
                ]);

                organizer = eventProps.organizer;

                message.guild.members
                    .fetch({ organizer, force: true })
                    .then((collec) => {
                        var member = collec.get(organizer);

                        eventDate = new Date(
                            eventProps.date + " " + eventProps.time
                        );

                        message.reply({
                            content: "Which property do you want to edit?",
                            embeds: [embedEvent(eventProps, member, eventDate)],
                            components: [editRow],
                            ephemeral: true,
                        });
                    });
            }
        } else if (message.content.startsWith("j!events cancel ")) {
            var eventId = message.content
                .split("j!events cancel ")[1]
                .toUpperCase();
            eventProps = parsedStorage.modules.events.list[eventId];
            if (typeof eventProps == "undefined") {
                message.reply({ content: "Event not found!", ephemeral: true });
            } else if (message.author.id != eventProps.organizer) {
                message.reply({
                    content:
                        "You need to be the organizer of the event to cancel it.",
                    ephemeral: true,
                });
            } else {
                // you can cancel event
                const editRow = new MessageActionRow().addComponents([
                    new MessageButton()
                        .setCustomId("eventscancel " + eventId + " cancel")
                        .setLabel("Cancel Event")
                        .setStyle("DANGER"),
                    new MessageButton()
                        .setCustomId("eventscancel " + eventId + " skipcancel")
                        .setLabel("X")
                        .setStyle("PRIMARY"),
                ]);

                organizer = eventProps.organizer;

                message.guild.members
                    .fetch({ organizer, force: true })
                    .then((collec) => {
                        var member = collec.get(organizer);

                        eventDate = new Date(
                            eventProps.date + " " + eventProps.time
                        );

                        message.reply({
                            content:
                                "Are you sure you want to cancel this event?",
                            embeds: [embedEvent(eventProps, member, eventDate)],
                            components: [editRow],
                            ephemeral: true,
                        });
                    });
            }
        } else if (message.content.startsWith("j!events show")) {
            if (
                message.content.replace(/\s+/g, "").split("j!eventsshow")[1]
                    .length < 1
            ) {
                if (parsedStorage.modules.events.list.length == 0) {
                    message.reply(
                        "No events could be found in the storage. Use `j!events create` to create an event."
                    );
                } else {
                    // Show events on the block
                    storage = fs.readFileSync("./storage.json");
                    parsedStorage = JSON.parse(storage);

                    showMenu = new MessageEmbed()
                        .setColor("#decaf5")
                        .setTitle("Upcoming Events")
                        .setAuthor({
                            name: message.author.username,
                            iconURL: message.author.displayAvatarURL(),
                        })
                        .addFields(
                            Object.values(parsedStorage.modules.events.list)
                                .splice(0, 25)
                                .map((d) => {
                                    return {
                                        name: d.id + ". " + d.name,
                                        value:
                                            moment(
                                                new Date(d.date + " " + d.time)
                                            ).format(
                                                "dddd, MMMM Do [at] h:mm A"
                                            ) +
                                            ", " +
                                            d.location,
                                        inline: false,
                                    };
                                })
                        )
                        .setDescription(
                            "Use the buttons to navigate and RSVP to events."
                        )
                        .setFooter({
                            text: "j!events",
                        });

                    var moveButtons = new MessageActionRow().addComponents([
                        new MessageButton()
                            .setCustomId("eventsnav index left")
                            .setLabel("◀")
                            .setStyle("SECONDARY")
                            .setDisabled(true),
                        new MessageButton()
                            .setCustomId("eventsnav index rsvp")
                            .setLabel("RSVP")
                            .setStyle("PRIMARY")
                            .setDisabled(true),
                        new MessageButton()
                            .setCustomId("eventsnav index unrsvp")
                            .setLabel("UN RSVP")
                            .setStyle("PRIMARY")
                            .setDisabled(true),
                        new MessageButton()
                            .setCustomId("eventsnav index right")
                            .setLabel("▶")
                            .setStyle("SECONDARY"),
                    ]);

                    message.reply({
                        embeds: [showMenu],
                        components: [moveButtons],
                    });
                }
            } else {
                if (
                    Object.keys(parsedStorage.modules.events.list).includes(
                        message.content
                            .replace(/\s+/g, "")
                            .split("j!eventsshow")[1]
                            .toUpperCase()
                    )
                ) {
                    eventProps =
                        parsedStorage.modules.events.list[
                            message.content
                                .replace(/\s+/g, "")
                                .split("j!eventsshow")[1]
                                .toUpperCase()
                        ];

                    indexOfEvents = Object.keys(
                        parsedStorage.modules.events.list
                    ).indexOf(
                        message.content
                            .replace(/\s+/g, "")
                            .split("j!eventsshow")[1]
                            .toUpperCase()
                    );

                    var moveButtons = new MessageActionRow().addComponents([
                        new MessageButton()
                            .setCustomId("eventsnav " + eventProps.id + " left")
                            .setLabel("◀")
                            .setStyle("SECONDARY"),
                        new MessageButton()
                            .setCustomId("eventsnav " + eventProps.id + " rsvp")
                            .setLabel("RSVP")
                            .setStyle("PRIMARY"),
                        new MessageButton()
                            .setCustomId(
                                "eventsnav " + eventProps.id + " unrsvp"
                            )
                            .setLabel("UN RSVP")
                            .setStyle("PRIMARY"),
                        new MessageButton()
                            .setCustomId(
                                "eventsnav " + eventProps.id + " right"
                            )
                            .setLabel("▶")
                            .setStyle("SECONDARY")
                            .setDisabled(
                                indexOfEvents ==
                                    Object.keys(
                                        parsedStorage.modules.events.list
                                    ).length -
                                        1
                            ),
                    ]);

                    organizer = eventProps.organizer;

                    message.guild.members
                        .fetch({ organizer, force: true })
                        .then((collec) => {
                            var member = collec.get(organizer);

                            eventDate = new Date(
                                eventProps.date + " " + eventProps.time
                            );

                            message.reply({
                                embeds: [
                                    embedEvent(eventProps, member, eventDate),
                                ],
                                components: [moveButtons],
                            });
                        });
                } else {
                    message.reply(
                        "Could not find ID in list. Use `j!events show` to show upcoming events and their ids."
                    );
                }
            }
        } else {
            var helpMenu = new MessageEmbed()
                .setColor("#decaf5")
                .setTitle("Events")
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setDescription(
                    "The events module can be used by anyone to organize and manage events. You can add dates, times and locations to these events and others can rsvp to these events. Use this module to post an event or find people to hangout with."
                )
                .addFields(
                    {
                        name: "j!events create",
                        value: "Generates an event builder.",
                        inline: true,
                    },
                    {
                        name: "j!events edit <eventID>",
                        value: "Generates an event editor for said event <eventID>, and no the <>'s are not needed.",
                        inline: true,
                    },
                    {
                        name: "j!events cancel <eventID>",
                        value: "Gives you the option to cancel said event <eventID>, and no the <>'s are not needed",
                        inline: true,
                    },
                    {
                        name: "j!events show  OR j!events show <eventID>",
                        value: "Shows a list of events if used without parameters.\n If used with parameters, shows said event <eventID>, and no the <>'s are not needed.",
                        inline: true,
                    }
                );
            message.channel.send({ embeds: [helpMenu] });
        }
    } catch {
        message.channel.send(
            "Something went wrong, ask Sanjit before continuing"
        );
    }
};

const interactionCreate = (interaction) => {
    try {
        storage = fs.readFileSync("./storage.json");
        parsedStorage = JSON.parse(storage);
        if (
            interaction.isButton() &&
            interaction.customId.split("eventsstart").length == 2
        ) {
            if (
                interaction.customId.split("eventsstart")[0] !=
                interaction.member.id
            ) {
                interaction.reply({
                    content:
                        "This button was made for another user. To create your own use j!events create",
                    ephemeral: true,
                });
            } else {
                const modal = new Modal()
                    .setCustomId(
                        interaction.customId.split("eventsstart")[0] +
                            "eventscreateModal" +
                            interaction.customId.split("eventsstart")[1]
                    )
                    .setTitle("Create Event");

                const name = new TextInputComponent()
                    .setCustomId(
                        "name" + interaction.customId.split("eventsstart")[1]
                    )
                    .setLabel("Name")
                    .setStyle("SHORT");
                const description = new TextInputComponent()
                    .setCustomId(
                        "description" +
                            interaction.customId.split("eventsstart")[1]
                    )
                    .setLabel("Description")
                    .setStyle("PARAGRAPH");
                const date = new TextInputComponent()
                    .setCustomId(
                        "date" + interaction.customId.split("eventsstart")[1]
                    )
                    .setLabel("Date")
                    .setStyle("SHORT");
                const time = new TextInputComponent()
                    .setCustomId(
                        "time" + interaction.customId.split("eventsstart")[1]
                    )
                    .setLabel("Time")
                    .setStyle("SHORT");
                const location = new TextInputComponent()
                    .setCustomId(
                        "location" +
                            interaction.customId.split("eventsstart")[1]
                    )
                    .setLabel("Location")
                    .setStyle("SHORT");

                modal.addComponents(new MessageActionRow().addComponents(name));
                modal.addComponents(
                    new MessageActionRow().addComponents(description)
                );
                modal.addComponents(new MessageActionRow().addComponents(date));
                modal.addComponents(new MessageActionRow().addComponents(time));
                modal.addComponents(
                    new MessageActionRow().addComponents(location)
                );
                interaction.showModal(modal);
            }
        } else if (
            interaction.type == "MODAL_SUBMIT" &&
            interaction.customId.split("eventscreateModal").length == 2
        ) {
            next = parsedStorage.modules.events.next;
            userID = interaction.customId.split("eventscreateModal")[0];
            details = {
                id: (next * 13).toString(18).toUpperCase(),
                name: interaction.fields
                    .getTextInputValue(
                        "name" +
                            interaction.customId.split("eventscreateModal")[1]
                    )
                    .match(filter)
                    .join(""),
                description: interaction.fields
                    .getTextInputValue(
                        "description" +
                            interaction.customId.split("eventscreateModal")[1]
                    )
                    .match(filter)
                    .join(""),
                date: interaction.fields
                    .getTextInputValue(
                        "date" +
                            interaction.customId.split("eventscreateModal")[1]
                    )
                    .match(filter)
                    .join(""),
                time: interaction.fields
                    .getTextInputValue(
                        "time" +
                            interaction.customId.split("eventscreateModal")[1]
                    )
                    .match(filter)
                    .join(""),
                location: interaction.fields
                    .getTextInputValue(
                        "location" +
                            interaction.customId.split("eventscreateModal")[1]
                    )
                    .match(filter)
                    .join(""),
                organizer: userID,
                rsvplist: {},
            };
            details.rsvplist[userID] = interaction.member.displayName;
            eventDate = new Date(details.date + " " + details.time);
            eventDate.setYear(2022);
            eventDate.setYear(
                eventDate.getFullYear() + (eventDate < new Date() ? 1 : 0)
            );
            details.year = eventDate.getFullYear();

            if (eventDate == "Invalid Date") {
                interaction.reply({
                    content:
                        "Invalid Date or Time recieved. Click on the button to try again.",
                    ephemeral: true,
                });
            } else {
                interaction.guild.members
                    .fetch({ userID, force: true })
                    .then((collec) => {
                        var member = collec.get(userID);

                        interaction.reply({
                            content: "Event created!",
                            embeds: [embedEvent(details, member, eventDate)],
                        });
                        parsedStorage.modules.events.next += 1;
                        parsedStorage.modules.events.list[details.id] = details;
                        fs.writeFileSync(
                            "./storage.json",
                            JSON.stringify(parsedStorage, null, "\t")
                        );
                    });
            }
        } else if (
            interaction.isButton() &&
            interaction.customId.startsWith("eventsedit")
        ) {
            if (
                !Object.keys(parsedStorage.modules.events.list).includes(
                    interaction.customId.split(" ")[1]
                )
            ) {
                interaction.reply({
                    content: "Event does not exist anymore.",
                    ephemeral: true,
                });
                return;
            }
            if (
                parsedStorage.modules.events.list[
                    interaction.customId.split(" ")[1]
                ].organizer != interaction.member.id
            ) {
                interaction.reply({
                    content:
                        "This button was made for another user. To create your own use j!events create",
                    ephemeral: true,
                });
            } else {
                const modal = new Modal()
                    .setCustomId(
                        "eventsmodaledit" +
                            interaction.customId.split("eventsedit")[1]
                    )
                    .setTitle(interaction.customId.split(" ")[2]);
                const storageInput = new TextInputComponent()
                    .setCustomId(
                        "eventsmodaledit" +
                            interaction.customId.split("eventsedit")[1]
                    )
                    .setLabel(interaction.customId.split(" ")[2])
                    .setStyle(
                        interaction.customId.endsWith("description")
                            ? "PARAGRAPH"
                            : "SHORT"
                    );
                const actionRow = new MessageActionRow().addComponents(
                    storageInput
                );
                modal.addComponents(actionRow);
                interaction.showModal(modal);
            }
        } else if (
            interaction.type == "MODAL_SUBMIT" &&
            interaction.customId.startsWith("eventsmodaledit")
        ) {
            if (
                parsedStorage.modules.events.list[
                    interaction.customId.split(" ")[1]
                ].organizer != interaction.member.id
            ) {
                interaction.reply({
                    content:
                        "This button was made for another user. To create your own use j!events create",
                    ephemeral: true,
                });
            } else {
                if (
                    interaction.customId.endsWith("date") ||
                    interaction.customId.endsWith("time")
                ) {
                    details =
                        parsedStorage.modules.events.list[
                            interaction.customId.split(" ")[1]
                        ];

                    details[interaction.customId.split(" ")[2]] =
                        interaction.fields
                            .getTextInputValue(interaction.customId)
                            .match(filter)
                            .join("");

                    eventDate = new Date(details.date + " " + details.time);

                    if (eventDate == "Invalid Date") {
                        interaction.reply({
                            content:
                                "Invalid Date or Time recieved. Click on the button to try again.",
                            ephemeral: true,
                        });
                    } else {
                        eventDate.setYear(2022);
                        eventDate.setYear(
                            eventDate.getFullYear() +
                                (eventDate < new Date() ? 1 : 0)
                        );
                        details.year = eventDate.getFullYear();
                    }
                } else {
                    details =
                        parsedStorage.modules.events.list[
                            interaction.customId.split(" ")[1]
                        ];
                    details[interaction.customId.split(" ")[2]] =
                        interaction.fields
                            .getTextInputValue(interaction.customId)
                            .match(filter)
                            .join("");
                }
                eventDate = new Date(details.date + " " + details.time);

                userID = interaction.member.id;
                interaction.guild.members
                    .fetch({ userID, force: true })
                    .then((collec) => {
                        var member = collec.get(userID);

                        interaction.message.edit({
                            content: "Event edited!",
                            embeds: [embedEvent(details, member, eventDate)],
                        });

                        parsedStorage.modules.events.list[details.id] = details;
                        fs.writeFileSync(
                            "./storage.json",
                            JSON.stringify(parsedStorage, null, "\t")
                        );
                        interaction.reply({
                            content: "Edited",
                            ephemeral: true,
                        });
                    });
            }
        } else if (
            interaction.isButton() &&
            interaction.customId.startsWith("eventsnav")
        ) {
            storage = fs.readFileSync("./storage.json");
            parsedStorage = JSON.parse(storage);

            if (
                !Object.keys(parsedStorage.modules.events.list).includes(
                    interaction.customId.split(" ")[1]
                ) &&
                interaction.customId.split(" ")[1] != "index"
            ) {
                interaction.reply({
                    content:
                        "Uh oh this event does not exist anymore. Use `j!events show` to show existing events.",
                    ephemeral: true,
                });
                return;
            }

            // if rsvp/unrsvp stuff
            if (interaction.customId.endsWith("unrsvp")) {
                delete parsedStorage.modules.events.list[
                    interaction.customId.split(" ")[1]
                ].rsvplist[interaction.member.id];

                eventProps =
                    parsedStorage.modules.events.list[
                        interaction.customId.split(" ")[1]
                    ];
                organizer = eventProps.organizer;

                interaction.guild.members
                    .fetch({ organizer, force: true })
                    .then((collec) => {
                        var member = collec.get(organizer);

                        eventDate = new Date(
                            eventProps.date + " " + eventProps.time
                        );

                        interaction.update({
                            embeds: [embedEvent(eventProps, member, eventDate)],
                        });
                    });
            } else if (interaction.customId.endsWith("rsvp")) {
                if (
                    !Object.keys(
                        parsedStorage.modules.events.list[
                            interaction.customId.split(" ")[1]
                        ].rsvplist
                    ).includes(interaction.member.id)
                )
                    parsedStorage.modules.events.list[
                        interaction.customId.split(" ")[1]
                    ].rsvplist[interaction.member.id] =
                        interaction.member.displayName;

                eventProps =
                    parsedStorage.modules.events.list[
                        interaction.customId.split(" ")[1]
                    ];
                organizer = eventProps.organizer;

                interaction.guild.members
                    .fetch({ organizer, force: true })
                    .then((collec) => {
                        var member = collec.get(organizer);

                        eventDate = new Date(
                            eventProps.date + " " + eventProps.time
                        );

                        interaction.update({
                            embeds: [embedEvent(eventProps, member, eventDate)],
                        });
                    });
            } else {
                indexOfEvents = Object.keys(
                    parsedStorage.modules.events.list
                ).indexOf(interaction.customId.split(" ")[1]);
                if (interaction.customId.endsWith("right")) {
                    indexOfEvents += 1;
                } else if (interaction.customId.endsWith("left")) {
                    indexOfEvents -= 1;
                }
                if (indexOfEvents == -1) {
                    showMenu = new MessageEmbed()
                        .setColor("#decaf5")
                        .setTitle("Upcoming Events")
                        .setAuthor({
                            name: interaction.message.author.username,
                            iconURL:
                                interaction.message.author.displayAvatarURL(),
                        })
                        .addFields(
                            Object.values(parsedStorage.modules.events.list)
                                .splice(0, 25)
                                .map((d) => {
                                    return {
                                        name: d.id + ". " + d.name,
                                        value:
                                            moment(
                                                new Date(
                                                    eventProps.date +
                                                        " " +
                                                        eventProps.time
                                                )
                                            ).format(
                                                "dddd, MMMM Do [at] h:mm A"
                                            ) +
                                            ", " +
                                            d.location,
                                        inline: false,
                                    };
                                })
                        )
                        .setDescription(
                            "Use the buttons to navigate and RSVP to events."
                        )
                        .setFooter({
                            text: "j!events",
                        });

                    var moveButtons = new MessageActionRow().addComponents([
                        new MessageButton()
                            .setCustomId("eventsnav index left")
                            .setLabel("◀")
                            .setStyle("SECONDARY")
                            .setDisabled(true),
                        new MessageButton()
                            .setCustomId("eventsnav index rsvp")
                            .setLabel("RSVP")
                            .setStyle("PRIMARY")
                            .setDisabled(true),
                        new MessageButton()
                            .setCustomId("eventsnav index unrsvp")
                            .setLabel("UN RSVP")
                            .setStyle("PRIMARY")
                            .setDisabled(true),
                        new MessageButton()
                            .setCustomId("eventsnav index right")
                            .setLabel("▶")
                            .setStyle("SECONDARY"),
                    ]);

                    interaction.update({
                        embeds: [showMenu],
                        components: [moveButtons],
                    });
                } else if (
                    indexOfEvents ==
                    Object.keys(parsedStorage.modules.events.list).length
                ) {
                    interaction.reply({
                        content:
                            "No events could be found in the storage. Use `j!events create` to create an event.",
                        ephemeral: true,
                    });
                } else {
                    eventProps =
                        parsedStorage.modules.events.list[
                            Object.keys(parsedStorage.modules.events.list)[
                                indexOfEvents
                            ]
                        ];

                    var moveButtons = new MessageActionRow().addComponents([
                        new MessageButton()
                            .setCustomId("eventsnav " + eventProps.id + " left")
                            .setLabel("◀")
                            .setStyle("SECONDARY"),
                        new MessageButton()
                            .setCustomId("eventsnav " + eventProps.id + " rsvp")
                            .setLabel("RSVP")
                            .setStyle("PRIMARY"),
                        new MessageButton()
                            .setCustomId(
                                "eventsnav " + eventProps.id + " unrsvp"
                            )
                            .setLabel("UN RSVP")
                            .setStyle("PRIMARY"),
                        new MessageButton()
                            .setCustomId(
                                "eventsnav " + eventProps.id + " right"
                            )
                            .setLabel("▶")
                            .setStyle("SECONDARY")
                            .setDisabled(
                                indexOfEvents ==
                                    Object.keys(
                                        parsedStorage.modules.events.list
                                    ).length -
                                        1
                            ),
                    ]);

                    organizer = eventProps.organizer;

                    interaction.guild.members
                        .fetch({ organizer, force: true })
                        .then((collec) => {
                            var member = collec.get(organizer);

                            eventDate = new Date(
                                eventProps.date + " " + eventProps.time
                            );

                            interaction.update({
                                embeds: [
                                    embedEvent(eventProps, member, eventDate),
                                ],
                                components: [moveButtons],
                            });
                        });
                }
            }
        } else if (
            interaction.isButton() &&
            interaction.customId.startsWith("eventscancel")
        ) {
            if (
                !Object.keys(parsedStorage.modules.events.list).includes(
                    interaction.customId.split(" ")[1]
                )
            ) {
                interaction.reply({
                    content: "Event does not exist anymore.",
                    ephemeral: true,
                });
                return;
            }
            if (interaction.customId.endsWith("skipcancel")) {
                interaction.reply({ content: "Event not canceled." });
            } else if (interaction.customId.endsWith("cancel")) {
                delete parsedStorage.modules.events.list[
                    interaction.customId.split(" ")[1]
                ];
                interaction.reply({ content: "Event has been canceled!" });
            }
        }

        fs.writeFileSync(
            "./storage.json",
            JSON.stringify(parsedStorage, null, "\t")
        );
    } catch (e) {
        interaction.message.channel.send(
            "Something went wrong talk to Snajit."
        );
        console.log(e);
    }
};

const at8AM = (client) => {
    try {
        // Check peoples events in the morning.

        storage = fs.readFileSync("./storage.json");
        parsedStorage = JSON.parse(storage);

        Object.values(parsedStorage.modules.events.list).forEach((event) => {
            ed = new Date(event.date + " " + event.time);
            ed.setYear(event.year);
            today = new Date();
            if (today > ed) {
                delete parsedStorage.modules.events.list[event.id];
                fs.writeFileSync(
                    "./storage.json",
                    JSON.stringify(parsedStorage, null, "\t")
                );
            } else if (ed - today < 86400000) {
                setTimeout(() => {
                    if (
                        Object.keys(parsedStorage.modules.events.list).includes(
                            event.id
                        )
                    ) {
                        client.guilds.cache
                            .get(constants.guild)
                            .channels.cache.get(constants.channels.meetups)
                            .send(
                                event.name +
                                    " is starting right now! " +
                                    (Object.keys(event.rsvplist).length == 0
                                        ? ""
                                        : "<@" +
                                          Object.keys(event.rsvplist).join(
                                              "> <@"
                                          ) +
                                          ">")
                            );
                    }
                }, ed - today);
            }
        });

        if (!Object.keys(parsedStorage.modules.events.list).length == 0) {
            // Show events on the block
            storage = fs.readFileSync("./storage.json");
            parsedStorage = JSON.parse(storage);

            showMenu = new MessageEmbed()
                .setColor("#decaf5")
                .setTitle("Upcoming Events")
                .setAuthor({
                    name: client.user.username,
                    iconURL: client.user.displayAvatarURL(),
                })
                .addFields(
                    Object.values(parsedStorage.modules.events.list)
                        .splice(0, 25)
                        .map((d) => {
                            return {
                                name: d.id + ". " + d.name,
                                value:
                                    moment(
                                        new Date(d.date + " " + d.time)
                                    ).format("dddd, MMMM Do [at] h:mm A") +
                                    ", " +
                                    d.location,
                                inline: false,
                            };
                        })
                )
                .setDescription(
                    "Use the buttons to navigate and RSVP to events."
                )
                .setFooter({
                    text: "j!events",
                });

            var moveButtons = new MessageActionRow().addComponents([
                new MessageButton()
                    .setCustomId("eventsnav index left")
                    .setLabel("◀")
                    .setStyle("SECONDARY")
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId("eventsnav index rsvp")
                    .setLabel("RSVP")
                    .setStyle("PRIMARY")
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId("eventsnav index unrsvp")
                    .setLabel("UN RSVP")
                    .setStyle("PRIMARY")
                    .setDisabled(true),
                new MessageButton()
                    .setCustomId("eventsnav index right")
                    .setLabel("▶")
                    .setStyle("SECONDARY"),
            ]);

            client.guilds.cache
                .get(constants.guild)
                .channels.cache.get(constants.channels.meetups)
                .send({
                    embeds: [showMenu],
                    components: [moveButtons],
                });
        }
    } catch (e) {
        console.log(e);
    }
};

// fs.writeFileSync("./modules/events.json", JSON.stringify(parsedStorage));

module.exports = { commands, at8AM, interactionCreate };
