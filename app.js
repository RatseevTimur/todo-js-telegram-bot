import express from 'express'
import { PORT, TOKEN, APIKEY } from './config.js'
import Telegraf from 'telegraf'
import session from 'telegraf/session.js'
import axios from 'axios'
import { getMainMenu, yesNoKeyboard, resetKeyboard } from './keyboards.js'
import { getMyTasks, addTask, deleteTask, reset} from './db.js'

const app = express()
const bot = new Telegraf(TOKEN)

bot.use(session())

bot.start(ctx => {
    ctx.replyWithHTML(
        'Приветсвую в <b>TaskManagerBot</b>\n\n'+
        'Чтобы быстро добавить задачу, просто напишите ее и отправьте боту.'+
        'Кстати, еще вы можете узнать погоду отправив геопозицию (Свою или любой точки на карте =)',
        getMainMenu())
})

bot.hears('Мои задачи', async ctx => {
    const tasks = await getMyTasks()
    let result = ''

    for (let i = 0; i < tasks.length; i++) {
        result = result + `[${i+1}] ${tasks[i]}\n`
    }

    ctx.replyWithHTML(
        '<b>Список ваших задач:</b>\n\n'+
        `${result}`
    )
})

bot.hears('Удалить задачу', ctx => {
    ctx.replyWithHTML(
        'Введите фразу <i>"удалить `порядковый номер задачи`"</i>, чтобы удалить сообщение,'+
        'например, <b>"удалить 3"</b>:'+
        '<b>Можно полностью очистить весь список, если написать "удалить все!"</b>'
    )
})

bot.hears(/^удалить\s(\d+)$/, ctx => {
    const id = Number(+/\d+/.exec(ctx.message.text)) - 1
    deleteTask(id)
    ctx.reply('Ваша задача успешно удалена')
})

bot.hears(/^удалить все!/, ctx => {

    ctx.replyWithHTML(
        `Вы действительно хотите очистить список всех задач?\n\n`,
        resetKeyboard()
    )
    bot.action(['reset', 'no'], ctx => {
        if (ctx.callbackQuery.data === 'reset') {
            reset()
            ctx.editMessageText('Список очищен')
        } else {
            ctx.deleteMessage()
        }
    })
    
})


bot.on('text', ctx => {
    ctx.session.taskText = ctx.message.text

    ctx.replyWithHTML(
        `Вы действительно хотите добавить задачу:\n\n`+
        `<i>${ctx.message.text}</i>`,
        yesNoKeyboard()
    )
})

bot.action(['yes', 'no'], ctx => {
    if (ctx.callbackQuery.data === 'yes') {
        addTask(ctx.session.taskText)
        ctx.editMessageText('Ваша задача успешно добавлена')
    } else {
        ctx.deleteMessage()
    }
})

////////POGODA//////
bot.on('message', async (ctx) => {
    console.log(ctx.message);
    if (ctx.message.location) {
      const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${ctx.message.location.latitude}&lon=${ctx.message.location.longitude}&appid=${APIKEY}`;
      const response = await axios.get(weatherAPIUrl);
      ctx.reply(`Осадки: ${response.data.weather[0].main} Градус Кельвина: ${response.data.main.temp} К
      Влажность: ${response.data.main.humidity}`);
    }
})
////////////////////

bot.launch()
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`))
