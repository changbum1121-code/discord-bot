const express = require('express');
const axios = require('axios');
const app = express();

const CLIENT_ID = '1553069362045390868';
// Developer Portal에서 받은 Client Secret 값을 아래 작은따옴표 안에 넣어주세요
const CLIENT_SECRET = 'x1VKzHOya8JUfnL6_d7v2Lbq4Whs7Odp';
const REDIRECT_URI = 'https://discord-bot-57cz.onrender.com/callback';
// 알려주신 서버 ID 및 역할 ID 적용 완료
const GUILD_ID = '1537979907408273539'; 
const MEMBER_ROLE_ID = '1538026789987684442'; 
const BOT_TOKEN = 'MTU1MzA2OTM2MjA0NTM5MDg2OA.GwjEUG.Ipp5JXoi3Gn-uN6C3Rs4sglSDIU3P6WLYkD0HY';
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

app.listen(3000, () => console.log('인증 서버가 3000번 포트에서 가동 중입니다.'));
