require("dotenv").config();

const fs = require("fs");

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require("discord.js");

const Parser = require("rss-parser");

const parser = new Parser();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const DATA_FILE = "lastVideo.json";

let lastVideo = null;

// Cargar último video guardado
if (fs.existsSync(DATA_FILE)) {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));

    lastVideo = data.lastVideo;
}

client.once("ready", async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    checkYoutube();

    setInterval(checkYoutube, 60000);
});

async function checkYoutube() {

    try {

        const feed = await parser.parseURL(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_CHANNEL_ID}`
        );

        const latestVideo = feed.items[0];

        if (!latestVideo) return;

        // Evitar duplicados
        if (latestVideo.link === lastVideo) {
            return;
        }

        const channel = await client.channels.fetch(
            process.env.CHANNEL_ID
        );

        const embed = new EmbedBuilder()
            .setColor("Purple")
            .setTitle("🎥 Ferfi ha subido un nuevo video")
            .setDescription(latestVideo.title)
            .setURL(latestVideo.link)
            .setImage(`https://img.youtube.com/vi/${latestVideo.link.split("v=")[1]}/maxresdefault.jpg`)
            .setTimestamp();

        await channel.send({
            content: `@everyone # 🚨 Nuevo video disponible\n${latestVideo.link}`,
            embeds: [embed]
        });

        console.log("✅ Video enviado");

        // Guardar último video
        lastVideo = latestVideo.link;

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify({
                lastVideo
            })
        );

    }
    catch (error) {
        console.log(error);
    }
}

client.login(process.env.DISCORD_TOKEN);
