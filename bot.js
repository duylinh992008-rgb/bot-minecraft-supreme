const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const http = require('http');

// 6. chống render ngủ quên (tạo server ảo)
http.createServer((req, res) => { res.write("Bot Supreme v6 Online!"); res.end(); }).listen(10000);

const initbot = () => {
    const bot = mineflayer.createBot({
        host: 'nnlinh210.aternos.me',
        port: 24605,
        username: 'bot_supreme_afk',
        version: '1.20.4'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);

    bot.on('spawn', () => {
        console.log('===> BOT V6: DI CHUYEN - CHIEN DAU - SPAM <===');
        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        
        // 2. vượt vật cản tự tìm đường
        movements.canSwim = true;
        movements.allowParkour = true;
        movements.canDig = false; // tránh tự đào hố chôn mình
        bot.pathfinder.setMovements(movements);

        // 1. di chuyển liên tục không ngừng nghỉ
        const continuousMove = () => {
            const rx = Math.floor(Math.random() * 20) - 10;
            const rz = Math.floor(Math.random() * 20) - 10;
            const goal = new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 1);
            bot.pathfinder.setGoal(goal);
        };
        
        bot.on('goal_reached', () => {
            setTimeout(continuousMove, 100); // vừa tới là đi tiếp ngay sau 0.1s
        });
        continuousMove(); // bắt đầu chạy ngay khi spawn

        // 8. 3 giây chat ngẫu nhiên 1 lần
        const messages = [
            "tui là bot supreme nè", "di chuyển không mệt mỏi luôn", "ai đánh tui là tui vả lại đó",
            "server này vui ghê", "đang đi dạo thôi mà", "đừng có đụng vào tui", "admin đâu ra đây chơi"
        ];
        setInterval(() => {
            bot.chat(messages[Math.floor(Math.random() * messages.length)]);
        }, 3000);
    });

    // 3. đánh lại khi bị tấn công
    bot.on('attacked', (entity) => {
        if (entity) bot.pvp.attack(entity);
    });

    // 4. tự ăn để hồi sức
    bot.on('health', () => {
        if (bot.food < 18) {
            const food = bot.inventory.items().find(item => 
                ['bread', 'cooked_beef', 'cooked_chicken', 'apple', 'carrot'].includes(item.name)
            );
            if (food) bot.eat(food).catch(() => {});
        }
    });

    // 5. tự vào lại sau 5 giây khi văng server
    bot.on('death', () => bot.respawn());
    bot.on('end', () => {
        console.log('văng server rồi, 5 giây sau vào lại nè...');
        setTimeout(initbot, 5000);
    });

    // 7. chống lỗi vặt: bỏ qua mấy cái lỗi lặt vặt trong game
    bot.on('error', (err) => console.log('lỗi vặt nè nhưng hông sao: ' + err));
};

initbot();
