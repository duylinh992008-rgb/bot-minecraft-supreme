const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const http = require('http');

// 6. chống render ngủ quên (giữ bot sống 24/7)
http.createServer((req, res) => { res.write("Bot Supreme v11 Active!"); res.end(); }).listen(10000);

const initbot = () => {
    const bot = mineflayer.createBot({
        host: 'nnlinh210.aternos.me',
        port: 24605,
        username: 'bot_supreme_afk',
        version: '1.20.4'
    });

    // nạp plugin cho hành động chủ động
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(collectBlock);

    bot.on('spawn', () => {
        console.log('===> BOT V11: TU CHU - MUOT MA - KHONG LAG <===');
        
        // 9. tắt thông báo thừa để chống lag chat và server
        bot.chat('/gamerule sendCommandFeedback false');
        bot.settings.chat = 'commandsOnly';

        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        
        // 1 & 2. di chuyển mượt mà, vượt mọi địa hình
        movements.canSwim = true;
        movements.allowParkour = true;
        movements.allowSprinting = true;
        movements.canDig = false; // tắt tự đào để tránh lag và phá block vô ích
        bot.pathfinder.setMovements(movements);

        // 11. cơ chế tự chủ: tự tìm điểm đi hoặc tự nhặt đồ
        const autoMaster = () => {
            if (bot.pvp.target) return; // ưu tiên chiến đấu

            // 12. dùng thuật toán chọn điểm ngẫu nhiên nhẹ nhàng
            const rx = Math.floor(Math.random() * 30) - 15;
            const rz = Math.floor(Math.random() * 30) - 15;
            const goal = new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 2);
            
            bot.pathfinder.setGoal(goal);
        };

        // 1. duy trì di chuyển liên tục 
        setInterval(() => {
            if (!bot.pathfinder.isMoving()) autoMaster();
        }, 6000);

        bot.on('goal_reached', () => setTimeout(autoMaster, 500));

        // 8. 3 giây chat ngẫu nhiên giữ kết nối (chống afk)
        const chatList = [
            "tui dang lam viec nhe", "bot v11 sieu muot", "dang di farm do", 
            "ai do cho tui do di", "sinh ton vui qua", "chuc moi nguoi choi vui"
        ];
        setInterval(() => {
            bot.chat(chatList[Math.floor(Math.random() * chatList.length)]);
        }, 3000);

        // 10. tự chủ sinh tồn: nhặt đồ rơi trong tầm mắt (giảm bán kính để tránh lag)
        setInterval(() => {
            const item = bot.nearestEntity(e => (e.name === 'item' || e.name === 'collectable'));
            if (item && bot.entity.position.distanceTo(item.position) < 15) {
                bot.collectBlock.collect(item).catch(() => {});
            }
        }, 15000);
    });

    // 3. phản công khi bị tấn công
    bot.on('attacked', (entity) => {
        if (entity) {
            bot.chat("dang lam viec ma thich danh ah?");
            bot.pvp.attack(entity);
        }
    });

    // 4. tự ăn hồi máu chủ động
    bot.on('health', () => {
        if (bot.food < 15) {
            const food = bot.inventory.items().find(i => 
                ['bread', 'apple', 'cooked_beef', 'carrot', 'steak'].includes(i.name));
            if (food) bot.eat(food).catch(() => {});
        }
    });

    // 5 & 9. tự vào lại sau 5 giây & giữ kết nối bền bỉ
    bot.on('death', () => bot.respawn());
    bot.on('end', () => {
        console.log('mat ket noi, vao lai sau 5s...');
        setTimeout(initbot, 5000);
    });

    // 7. chống lỗi vặt: im lặng trước các lỗi nhỏ
    bot.on('error', () => {});
    bot.on('kicked', (reason) => console.log('bi kick: ' + reason));
};

initbot();
