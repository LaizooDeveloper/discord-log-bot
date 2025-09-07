const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Ensure the "data" folder exists
const dataPath = path.join(__dirname, "data");
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

// Function to get server settings
function getServerSettings(guildId) {
    const filePath = path.join(dataPath, `${guildId}.json`);
    if (!fs.existsSync(filePath)) {
        const defaultSettings = {
            logChannels: {
                messageDelete: null,
                messageUpdate: null,
                memberJoin: null,
                memberLeave: null
            }
        };
        fs.writeFileSync(filePath, JSON.stringify(defaultSettings, null, 4));
        return defaultSettings;
    } else {
        return JSON.parse(fs.readFileSync(filePath));
    }
}

// Function to save settings
function saveServerSettings(guildId, settings) {
    const filePath = path.join(dataPath, `${guildId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 4));
}

// When the bot is ready
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Member joins the server
client.on("guildMemberAdd", member => {
    const settings = getServerSettings(member.guild.id);
    const channelId = settings.logChannels.memberJoin;
    if (!channelId) return;

    const embed = new EmbedBuilder()
        .setTitle("New Member Joined")
        .setDescription(`${member.user.tag} has joined the server!`)
        .setColor("Green")
        .setTimestamp();

    const channel = member.guild.channels.cache.get(channelId);
    if (channel) channel.send({ embeds: [embed] });
});

// Member leaves the server
client.on("guildMemberRemove", member => {
    const settings = getServerSettings(member.guild.id);
    const channelId = settings.logChannels.memberLeave;
    if (!channelId) return;

    const embed = new EmbedBuilder()
        .setTitle("Member Left")
        .setDescription(`${member.user.tag} has left the server!`)
        .setColor("Red")
        .setTimestamp();

    const channel = member.guild.channels.cache.get(channelId);
    if (channel) channel.send({ embeds: [embed] });
});

// Message deleted
client.on("messageDelete", message => {
    if (message.author.bot) return;
    const settings = getServerSettings(message.guild.id);
    const channelId = settings.logChannels.messageDelete;
    if (!channelId) return;

    const embed = new EmbedBuilder()
        .setTitle("Message Deleted")
        .setDescription(`**Author:** ${message.author.tag}\n**Message:** ${message.content}`)
        .setColor("Orange")
        .setTimestamp();

    const channel = message.guild.channels.cache.get(channelId);
    if (channel) channel.send({ embeds: [embed] });
});

// Update settings via command
client.on("messageCreate", message => {
    if (!message.guild || !message.member.permissions.has("Administrator")) return;
    if (!message.content.startsWith("!logsetup")) return;

    const args = message.content.split(" ");
    const type = args[1]; // memberJoin, memberLeave, messageDelete
    const channel = message.mentions.channels.first();
    if (!type || !channel) return message.reply("Usage: !logsetup <type> #channel");

    const settings = getServerSettings(message.guild.id);
    settings.logChannels[type] = channel.id;
    saveServerSettings(message.guild.id, settings);

    message.reply(`Log channel for ${type} has been set to ${channel}`);
});

client.login(process.env.TOKEN);
