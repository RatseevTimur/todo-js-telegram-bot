import Markup from 'telegraf/markup.js'

export function getMainMenu() {
    return Markup.keyboard([
        ['Мои задачи', 'Удалить задачу']
    ]).resize().extra()
}

export function yesNoKeyboard() {
    return Markup.inlineKeyboard([
        Markup.callbackButton('Да', 'yes'),
        Markup.callbackButton('Нет', 'no')
    ], {columns: 2}).extra()
}

export function resetKeyboard() {
    return Markup.inlineKeyboard([
        Markup.callbackButton('Очистить', 'reset'),
        Markup.callbackButton('Нет', 'no')
    ], {columns: 2}).extra()
}

