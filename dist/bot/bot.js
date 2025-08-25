"use strict";
/**
 * @file: src/bot/bot.ts
 * @description: Инициализация бота grammY: только кнопки, базовые хендлеры
 * @created: 2025-08-19
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = createBot;
const grammy_1 = require("grammy");
const loadConfig_1 = require("../services/config/loadConfig");
const metrics_1 = require("../metrics/metrics");
function createBot(token, logger, appConfig, analytics) {
    if (!token) {
        throw new Error("TELEGRAM_BOT_TOKEN is required");
    }
    const bot = new grammy_1.Bot(token);
    const scheduledNextByChat = new Map();
    function scheduleNextPost(chatId, nextPostId) {
        if (nextPostId > 6)
            return;
        const existing = scheduledNextByChat.get(chatId);
        if (existing)
            clearTimeout(existing);
        const timeout = setTimeout(async () => {
            scheduledNextByChat.delete(chatId);
            try {
                await sendPost(chatId, nextPostId);
            }
            catch (err) {
                logger.error({ err, chatId, nextPostId }, "Failed to send scheduled next post");
            }
        }, 20000);
        scheduledNextByChat.set(chatId, timeout);
        logger.info({ chatId, nextPostId }, "Scheduled next post in 20 seconds");
    }
    (0, loadConfig_1.loadPostsConfig)(appConfig.content.posts_file, appConfig.content.posts_schema || "config/content/posts.schema.yaml")
        .then((cfg) => {
        logger.info({ posts: cfg.posts.length }, "Posts config loaded");
    })
        .catch((err) => {
        logger.error({ err }, "Failed to load posts config");
    });
    function trackedUrl(action, postId, to) {
        const base = (appConfig.public_base_url ?? "").trim();
        // В dev/локально — не оборачиваем, чтобы Telegram не ругался на localhost
        if (!base || base.includes("localhost") || base.includes("127.0.0.1")) {
            return to;
        }
        let url;
        try {
            url = new URL("/r", base);
        }
        catch {
            return to;
        }
        url.searchParams.set("action", action);
        url.searchParams.set("post", String(postId));
        url.searchParams.set("to", to);
        return url.toString();
    }
    async function logButtonClick(telegramId, username, postId, action) {
        if (analytics) {
            try {
                await analytics.logButtonClick(telegramId, username, postId, action);
            }
            catch (error) {
                logger.error({ error, telegramId, postId, action }, "Failed to log button click to Google Sheets");
            }
        }
    }
    function appendButton(kb, btn, postId) {
        switch (btn.action) {
            case "material":
                kb.text(btn.label, `material:${postId}`);
                break;
            case "support": {
                const to = btn.url;
                const wrapped = trackedUrl(btn.action, postId, to);
                kb.url(btn.label, wrapped);
                break;
            }
            case "community":
                kb.text(btn.label, `community:${postId}`);
                break;
            case "payment":
                kb.text(btn.label, `payment:${postId}`);
                break;
            case "webinar": {
                const to = btn.url;
                const wrapped = trackedUrl(btn.action, postId, to);
                kb.url(btn.label, wrapped);
                break;
            }
            case "jump":
                kb.text(btn.label, `jump:${postId}:${btn.target_post}`);
                break;
            default:
                break;
        }
    }
    function buildKeyboardFromPost(post) {
        const kb = new grammy_1.InlineKeyboard();
        const buttons = post.buttons;
        buttons.forEach((b, i) => {
            appendButton(kb, b, post.id);
            if (i < buttons.length - 1)
                kb.row();
        });
        return kb;
    }
    // Retry функция для отправки сообщений
    async function sendWithRetry(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                logger.warn({
                    attempt,
                    maxRetries,
                    error: error instanceof Error ? error.message : String(error)
                }, `Attempt ${attempt} failed, retrying...`);
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, delay * attempt));
                }
            }
        }
        throw lastError;
    }
    async function sendPost(chatId, postId) {
        const startTime = Date.now();
        try {
            const cfg = await (0, loadConfig_1.loadPostsConfig)(appConfig.content.posts_file, appConfig.content.posts_schema || "config/content/posts.schema.yaml");
            const post = cfg.posts.find((p) => p.id === postId) ?? cfg.posts[0];
            const keyboard = buildKeyboardFromPost(post);
            const caption = post.image?.caption && post.image.caption.length > 0
                ? post.image.caption
                : post.text_key ?? `Пост ${post.id}`;
            // Проверяем, является ли URL изображения валидным
            const isValidImageUrl = post.image?.url &&
                !post.image.url.includes('example.com') &&
                (post.image.url.startsWith('http') || post.image.url.startsWith('file_id'));
            if (isValidImageUrl) {
                try {
                    await sendWithRetry(() => bot.api.sendPhoto(chatId, post.image.url));
                    await sendWithRetry(() => bot.api.sendMessage(chatId, caption, {
                        reply_markup: keyboard,
                        parse_mode: "HTML"
                    }));
                }
                catch (sendErr) {
                    logger.warn({ err: sendErr, postId }, "Failed to send photo, sending text instead");
                    metrics_1.errorCounter.labels("photo_send_failed").inc();
                    await sendWithRetry(() => bot.api.sendMessage(chatId, caption, {
                        reply_markup: keyboard,
                        parse_mode: "HTML"
                    }));
                }
            }
            else {
                // Отправляем только текст, если нет валидного изображения
                await sendWithRetry(() => bot.api.sendMessage(chatId, caption, {
                    reply_markup: keyboard,
                    parse_mode: "HTML"
                }));
            }
            // Увеличиваем счетчик отправленных постов
            metrics_1.postSentCounter.labels(postId.toString()).inc();
            const nextId = post.id + 1;
            if (nextId <= 6) {
                scheduleNextPost(chatId, nextId);
            }
        }
        catch (error) {
            logger.error({ error, chatId, postId }, "Failed to send post");
            metrics_1.errorCounter.labels("post_send_failed").inc();
            // Fallback сообщение
            try {
                await bot.api.sendMessage(chatId, "Произошла ошибка при отправке поста. Попробуйте позже или обратитесь в поддержку.", { parse_mode: "HTML" });
            }
            catch (fallbackError) {
                logger.error({ fallbackError }, "Failed to send fallback message");
                metrics_1.errorCounter.labels("fallback_failed").inc();
            }
        }
        finally {
            // Записываем время отправки поста
            const duration = (Date.now() - startTime) / 1000;
            metrics_1.postSendDuration.labels(postId.toString()).inc(duration);
        }
    }
    bot.command("start", async (ctx) => {
        try {
            // Увеличиваем счетчик пользователей, начавших взаимодействие
            metrics_1.userStartCounter.inc();
            await logButtonClick(ctx.from?.id || 0, ctx.from?.username, 1, "start");
            await sendPost(ctx.chat.id, 1);
        }
        catch (err) {
            logger.error({ err }, "Failed to handle /start, falling back");
            metrics_1.errorCounter.labels("start_command_failed").inc();
            const keyboard = new grammy_1.InlineKeyboard().url("Техподдержка", appConfig.support.contact_url).row();
            await ctx.reply("Добро пожаловать в Neurohod! Используйте кнопки ниже.", {
                reply_markup: keyboard,
                parse_mode: "HTML",
            });
        }
    });
    bot.callbackQuery(/^material:(\d+)/, async (ctx) => {
        try {
            const postId = Number(ctx.match?.[1]);
            await logButtonClick(ctx.from?.id || 0, ctx.from?.username, postId, "material");
            const cfg = await (0, loadConfig_1.loadPostsConfig)(appConfig.content.posts_file, appConfig.content.posts_schema || "config/content/posts.schema.yaml");
            const post = cfg.posts.find((p) => p.id === postId);
            const materialBtn = post?.buttons.find((b) => b.action === "material");
            const materialUrl = materialBtn?.url || "https://example.com";
            // Разные сообщения для разных постов
            let message;
            if (postId === 2) {
                message = `Подготовили для тебя видео. Если где-то не догоняешь, беги за Нейроходом! <a href="${materialUrl}">догнать</a>`;
            }
            else {
                message = `Нейроход дарит основу, с которой отправиться в поход по нейромиру будет значительно проще!\nСделай первый шаг <a href="${materialUrl}">сюда</a>`;
            }
            await ctx.answerCallbackQuery();
            await ctx.reply(message, {
                parse_mode: "HTML",
                link_preview_options: { is_disabled: true }
            });
        }
        catch (err) {
            logger.error({ err }, "material callback error");
            await ctx.answerCallbackQuery({ text: "Ошибка. Попробуйте позже.", show_alert: false });
        }
    });
    bot.callbackQuery(/^community:(\d+)/, async (ctx) => {
        try {
            const postId = Number(ctx.match?.[1]);
            await logButtonClick(ctx.from?.id || 0, ctx.from?.username, postId, "community");
            const cfg = await (0, loadConfig_1.loadPostsConfig)(appConfig.content.posts_file, appConfig.content.posts_schema || "config/content/posts.schema.yaml");
            const post = cfg.posts.find((p) => p.id === postId);
            const communityBtn = post?.buttons.find((b) => b.action === "community");
            const message = communityBtn?.message ??
                "Изучи материалы, которые мы собрали для тебя совершенно бесплатно. Тогда узнаешь как попасть в сообщество. Всего 5 постов";
            await ctx.answerCallbackQuery();
            await ctx.reply(message, { parse_mode: "HTML" });
        }
        catch (err) {
            logger.error({ err }, "community callback error");
            await ctx.answerCallbackQuery({ text: "Ошибка. Попробуйте позже.", show_alert: false });
        }
    });
    bot.callbackQuery(/^payment:(\d+)/, async (ctx) => {
        try {
            const postId = Number(ctx.match?.[1]);
            await logButtonClick(ctx.from?.id || 0, ctx.from?.username, postId, "payment");
            await ctx.answerCallbackQuery();
            await ctx.reply("Оплата будет доступна на заключительном этапе. Следите за обновлениями.", { parse_mode: "HTML" });
        }
        catch (err) {
            logger.error({ err }, "payment callback error");
            await ctx.answerCallbackQuery({ text: "Ошибка. Попробуйте позже.", show_alert: false });
        }
    });
    bot.callbackQuery(/^jump:(\d+):(\d+)/, async (ctx) => {
        try {
            const currentPostId = Number(ctx.match?.[1]);
            const targetPostId = Number(ctx.match?.[2]);
            await logButtonClick(ctx.from?.id || 0, ctx.from?.username, currentPostId, "jump");
            await ctx.answerCallbackQuery();
            if (!ctx.chat) {
                logger.error({ currentPostId, targetPostId }, "No chat context in jump callback");
                return;
            }
            // Отменяем запланированный следующий пост, если он был
            const existing = scheduledNextByChat.get(ctx.chat.id);
            if (existing) {
                clearTimeout(existing);
                scheduledNextByChat.delete(ctx.chat.id);
                logger.info({ chatId: ctx.chat.id, currentPostId, targetPostId }, "Cancelled scheduled post due to jump");
            }
            // Отправляем целевой пост
            await sendPost(ctx.chat.id, targetPostId);
        }
        catch (err) {
            logger.error({ err }, "jump callback error");
            await ctx.answerCallbackQuery({ text: "Ошибка. Попробуйте позже.", show_alert: false });
        }
    });
    bot.on("message:text", async (ctx, next) => {
        const text = ctx.msg.text ?? "";
        if (text.startsWith("/")) {
            return next();
        }
        await ctx.reply("Пожалуйста, используйте кнопки под сообщением.");
    });
    return bot;
}
