require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const Parser = require("rss-parser");

const parser = new Parser();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let lastVideo = "";

client.once("ready", async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    checkYoutube();

    setInterval(checkYoutube, 60000);
});

async function checkYoutube() {
    try {

        const youtubeRSS =
            `https://www.youtube.com/feeds/videos.xml?channel_id=${process.env.YOUTUBE_CHANNEL_ID}`;

        const feed = await parser.parseURL(youtubeRSS);

        const latestVideo = feed.items[0];

        if (!latestVideo) return;

        if (latestVideo.link === lastVideo) return;

        lastVideo = latestVideo.link;

        const channel = await client.channels.fetch(process.env.CHANNEL_ID);

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("🎥 Nuevo video")
            .setDescription(`**${latestVideo.title}**`)
            .setURL(latestVideo.link)
            .setImage(latestVideo.thumbnail)
            .setTimestamp();

        channel.send({
            content: "@everyone 🚨 Nuevo video disponible",
            embeds: [embed]
        });

        console.log("✅ Video enviado");
    }
    catch (error) {
        console.log(error);
    }
}

client.login(process.env.DISCORD_TOKEN);