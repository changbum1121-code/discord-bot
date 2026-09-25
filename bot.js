const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

// Render 배포 주소에 맞게 수정 완료
const OAUTH_URL = "https://discord.com/oauth2/authorize?client_id=1553069362045390868&response_type=code&redirect_uri=https%3A%2F%2Fdiscord-bot-57cz.onrender.com%2Fcallback&scope=identify+guilds.join";

const MEMBER_ROLE_ID = '1538026789987684442'; 

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

client.login(process.env.DISCORD_TOKEN);


