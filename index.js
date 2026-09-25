const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');

// --- 1. 디스코드 봇 설정 ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

const CLIENT_ID = '1553069362045390868';
const CLIENT_SECRET = 'x1VKzHOya8JUfnL6_d7v2Lbq4Whs7Odp';
const REDIRECT_URI = 'https://discord-bot-57cz.onrender.com/callback';
const GUILD_ID = '1537979907408273539'; 
const MEMBER_ROLE_ID = '1538026789987684442'; 
const BOT_TOKEN = 'MTU1MzA2OTM2MjA0NTM5MDg2OA.GwjEUG.Ipp5JXoi3Gn-uN6C3Rs4sglSDIU3P6WLYkD0HY';

const OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify+guilds.join`;

client.on('ready', () => {
    console.log(`봇 로그인 성공: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.content === '!인증창생성') {
        const embed = new EmbedBuilder()
            .setTitle('발로란트 랜계 No.1 어스샵 [24h]')
            .setDescription(`이 인증은 복구용으로 사용되며 <@&${MEMBER_ROLE_ID}> 역할이 지급됩니다.\n인증 시 이메일, 접속 IP, 브라우저 정보가 인증 로그에 기록됩니다.\n\n\`identify\`, \`guilds.join\` 권한으로 인증합니다. 아래 버튼을 눌러 인증해 주세요!`)
            .setColor('#5865F2');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('인증하기')
                .setStyle(ButtonStyle.Link)
                .setURL(OAUTH_URL)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});

// --- 2. Express 인증 서버 설정 ---
const app = express();

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('인증 코드가 없습니다.');

    try {
        const tokenResponse = await axios.post('https://discord.com/api/v10/oauth2/token', new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token } = tokenResponse.data;

        const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const userId = userResponse.data.id;

        await axios.put(
            `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}/roles/${MEMBER_ROLE_ID}`,
            {},
            { headers: { Authorization: `Bot ${BOT_TOKEN}` } }
        );

        res.send('<h2>인증 성공! @Member 역할이 지급되었습니다. 디스코드로 돌아가세요.</h2>');

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send('역할 지급 처리 실패');
    }
});

// --- 3. 서버 및 봇 동시 실행 (로그 확인용 추가) ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`웹서버가 ${PORT}번 포트에서 가동 중입니다.`);
});

client.login(BOT_TOKEN)
    .then(() => {
        console.log(`디스코드 봇 로그인 성공 완료!`);
    })
    .catch((err) => {
        console.error('디스코드 봇 로그인 실패 에러:', err);
    });