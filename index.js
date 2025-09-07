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

// التأكد من وجود مجلد data
const dataPath = path.join(__dirname, "data");
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

// دالة للحصول على إعدادات السيرفر
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

// دالة لحفظ الإعدادات
function saveServerSettings(guildId, settings) {
    const filePath = path.join(dataPath, `${guildId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 4));
}

// عند جاهزية البوت
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// عضو يدخل السيرفر
client.on("guildMemberAdd", member => {
    const settings = getServerSettings(member.guild.id);
    const channelId = settings.logChannels.memberJoin;
    if (!channelId) return;

    const embed = new EmbedBuilder()
        .setTitle("عضو جديد دخل السيرفر")
        .setDescription(`${member.user.tag} انضم إلى السيرفر!`)
        .setColor("Green")
        .setTimestamp();

    const channel = member.guild.channels.cache.get(channelId);
    if (channel) channel.send({ embeds: [embed] });
});

// عضو يخرج من السيرفر
client.on("guildMemberRemove", member => {
    const settings = getServerSettings(member.guild.id);
    const channelId = settings.logChannels.memberLeave;
    if (!channelId) return;

    const embed = new EmbedBuilder()
        .setTitle("عضو غادر السيرفر")
        .setDescription(`${member.user.tag} غادر السيرفر!`)
        .setColor("Red")
        .setTimestamp();

    const channel = member.guild.channels.cache.get(channelId);
    if (channel) channel.send({ embeds: [embed] });
});

// حذف رسالة
client.on("messageDelete", message => {
    if (message.author.bot) return;
    const settings = getServerSettings(message.guild.id);
    const channelId = settings.logChannels.messageDelete;
    if (!channelId) return;

    const embed = new EmbedBuilder()
        .setTitle("تم حذف رسالة")
        .setDescription(`**المرسل:** ${message.author.tag}\n**الرسالة:** ${message.content}`)
        .setColor("Orange")
        .setTimestamp();

    const channel = message.guild.channels.cache.get(channelId);
    if (channel) channel.send({ embeds: [embed] });
});

// تحديث الإعدادات عبر أمر (Command)
client.on("messageCreate", message => {
    if (!message.guild || !message.member.permissions.has("Administrator")) return;
    if (!message.content.startsWith("!logsetup")) return;

    const args = message.content.split(" ");
    const type = args[1]; // memberJoin, memberLeave, messageDelete
    const channel = message.mentions.channels.first();
    if (!type || !channel) return message.reply("استخدم: !logsetup <type> #channel");

    const settings = getServerSettings(message.guild.id);
    settings.logChannels[type] = channel.id;
    saveServerSettings(message.guild.id, settings);

    message.reply(`تم تعيين قناة لوق ${type} إلى ${channel}`);
});

client.login(process.env.TOKEN);
