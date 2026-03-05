const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const http = require('http');

// 6. chống render ngủ quên (tạo web server duy trì)
http.createServer((req, res) => { res.write("Bot Supreme v8 Online!"); res.end(); }).listen(10000);

const initbot = () => {
    const bot = mineflayer.createBot({
        host: 'nnlinh210.aternos.me',
        port: 24605,
        username: 'bot_supreme_afk',
        version: '1.20.4'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(collectBlock);

    bot.on('spawn', () => {
        console.log('===> BOT V8: CHIEN THAN SINH TON <===');
        
        // 9. ẩn chat hệ thống để mượt server, bot vẫn hoạt động
        bot.chat('/gamerule sendCommandFeedback false');
        bot.settings.chat = 'commandsOnly';

        const mcData = require('minecraft-data')(bot.version);
        const movements = new Movements(bot, mcData);
        
        // 2. vượt vật cản (nhảy, bơi, leo trèo)
        movements.canSwim = true;
        movements.allowParkour = true;
        movements.allowSprinting = true;
        bot.pathfinder.setMovements(movements);

        // 1. di chuyển mượt mà liên tục
        const roam = () => {
            if (bot.pvp.target) return; // ưu tiên đánh nhau trước nếu bị công
            const rx = Math.floor(Math.random() * 30) - 15;
            const rz = Math.floor(Math.random() * 30) - 15;
            const goal = new goals.GoalNear(bot.entity.position.x + rx, bot.entity.position.y, bot.entity.position.z + rz, 2);
            bot.pathfinder.setGoal(goal);
        };

        // chống đứng yên: cứ 5 giây nếu không đi thì ép phải đi
        setInterval(() => {
            if (!bot.pathfinder.isMoving()) roam();
        }, 5000);

        bot.on('goal_reached', () => setTimeout(roam, 100));

        // 8. 3 giây chat ngẫu nhiên 1 lần (giữ server không sập)
        const messages = ["bot dang sinh ton", "khong afk dau nhe", "dang di dao quanh day", "ai ban do khong"];
        setInterval(() => {
            bot.chat(messages[Math.floor(Math.random() * messages.length)]);
        }, 3000);

        // 10. biết sinh tồn cơ bản (nhặt đồ gần đó)
        setInterval(() => {
            const drop = bot.nearestEntity(e => e.name === 'item' || e.name === 'collectable');
            if (drop && bot.entity.position.distanceTo(drop.position) < 10) {
                bot.pathfinder.setGoal(new goals.GoalFollow(drop, 1));
            }
        }, 10000);
    });

    // 3. phản công khi bị tấn công
    bot.on('attacked', (entity) => {
        if (entity && entity.type !== 'player') { // tự vệ trước quái
            bot.pvp.attack(entity);
        } else if (entity && entity.type === 'player') {
            bot.chat("sao danh tui?"); // phản hồi khi bị người đánh
            bot.pvp.attack(entity);
        }
    });

    // 4. tự ăn hồi sức (nếu có đồ ăn trong người)
    bot.on('health', () => {
        if (bot.food < 16) {
            const food = bot.inventory.items().find(item => 
                ['bread', 'cooked_beef', 'apple', 'carrot', 'cooked_chicken'].includes(item.name));
            if (food) bot.eat(food).catch(() => {});
        }
    });

    // 5 & 9. tự vào lại sau 5 giây & chống sập
    bot.on('death', () => bot.respawn());
    bot.on('end', () => {
        console.log('văng server, đang kết nối lại sau 5s...');
        setTimeout(initbot, 5000);
    });

    // 7. chống lỗi vặt (bỏ qua thông báo lỗi thừa)
    bot.on('error', (err) => console.log('loi vat: ' + err));
};

initbot();
        
