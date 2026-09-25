const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const axios = require('axios');

// --- 1. 설정값 ---
const CLIENT_ID = '1553069362045390868';
const CLIENT_SECRET = 'x1VKzHOya8JUfnL6_d7v2Lbq4Whs7Odp';
const REDIRECT_URI = 'https://discord-bot-57cz.onrender.com/callback';
const GUILD_ID = '1537979907408273539'; 
const MEMBER_ROLE_ID = '1538026789987684442'; 
const BOT_TOKEN = 'MTU1MzA2OTM2MjA0NTM5MDg2OA.GwjEUG.Ipp5JXoi3Gn-uN6C3Rs4sglSDIU3P6WLYkD0HY';

const OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=identify+guilds.join`;

// --- 2. Express 웹서버 설정 및 포트 바인딩 ---
const app = express();
const PORT = process.env.PORT || 10000; // Render 필수 포트 대응

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
        console.error('인증 처리 중 에러 발생:', error.response?.data || error.message);
        res.status(500).send('역할 지급 처리 실패');
    }
});

// 웹서버를 먼저 확실하게 띄우고 포트 로그를 명시적으로 출력합니다.
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[웹서버 성공] 포트 ${PORT}에서 정상적으로 실행 중입니다.`);
});

// --- 3. 디스코드 봇 설정 및 로그인 ---
console.log('[봇 준비] 디스코드 클라이언트 초기화 중...');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

client.once('ready', () => {
    console.log(`[봇 로그인 성공] ${client.user.tag} 계정으로 접속 완료!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    
    if (message.content === '!인증창생성') {
        console.log('[명령어 감지] !인증창생성 실행됨');
        try {
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
            console.log('[명령어 완료] 인증창 전송 성공');
        } catch (err) {
            console.error('[명령어 에러] 인증창 전송 실패:', err);
        }
    }
});

console.log('[봇 시도] 디스코드 로그인(client.login) 호출 중...');
client.login(BOT_TOKEN).catch(err => {
    console.error('[봇 로그인 에러 발생]:', err);
});