const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const dataPath = path.join(__dirname, "../data");
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);

// صفحة رئيسية تعرض جميع السيرفرات
app.get("/", (req, res) => {
    const files = fs.readdirSync(dataPath);
    const servers = files.map(file => {
        const settings = JSON.parse(fs.readFileSync(path.join(dataPath, file)));
        return { guildId: file.replace(".json", ""), logChannels: settings.logChannels };
    });
    res.render("index", { servers });
});

// إضافة سيرفر جديد
app.post("/add-server", (req, res) => {
    const guildId = req.body.guildId.trim();
    if (!guildId) return res.redirect("/");

    const filePath = path.join(dataPath, `${guildId}.json`);
    if (!fs.existsSync(filePath)) {
        const defaultSettings = {
            logChannels: {
                memberJoin: "",
                memberLeave: "",
                messageDelete: "",
                messageUpdate: "",
                roleUpdate: "",
                channelUpdate: ""
            }
        };
        fs.writeFileSync(filePath, JSON.stringify(defaultSettings, null, 4));
    }

    res.redirect("/edit/" + guildId); // مباشرة لتعديل القنوات
});

// صفحة تعديل إعدادات السيرفر
app.get("/edit/:guildId", (req, res) => {
    const guildId = req.params.guildId;
    const filePath = path.join(dataPath, `${guildId}.json`);
    if (!fs.existsSync(filePath)) return res.send("Server not found");

    const settings = JSON.parse(fs.readFileSync(filePath));
    res.render("edit", { guildId, logChannels: settings.logChannels });
});

// حفظ الإعدادات بعد تعديلها
app.post("/edit/:guildId", (req, res) => {
    const guildId = req.params.guildId;
    const filePath = path.join(dataPath, `${guildId}.json`);
    if (!fs.existsSync(filePath)) return res.send("Server not found");

    const newSettings = {
        logChannels: {
            memberJoin: req.body.memberJoin,
            memberLeave: req.body.memberLeave,
            messageDelete: req.body.messageDelete,
            messageUpdate: req.body.messageUpdate,
            roleUpdate: req.body.roleUpdate,
            channelUpdate: req.body.channelUpdate
        }
    };

    fs.writeFileSync(filePath, JSON.stringify(newSettings, null, 4));
    res.redirect("/");
});

app.listen(3000, () => console.log("Website panel running on port 3000"));
