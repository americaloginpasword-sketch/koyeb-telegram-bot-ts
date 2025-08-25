/**
 * @file: src/bot/bot.ts
 * @description: Инициализация бота grammY: только кнопки, базовые хендлеры
 * @created: 2025-08-19
 */

import { Bot, InlineKeyboard } from "grammy";
import type { Logger } from "pino";
import type { AppConfig, PostConfig, PostButton } from "../services/config/types";
import { loadPostsConfig } from "../services/config/loadConfig";
import type { GoogleSheetsAnalytics } from "../services/analytics/googleSheets";
import { 
  postSentCounter, 
  userStartCounter, 
  errorCounter, 
  postSendDuration 
} from "../metrics/metrics";

export function createBot(token: string, logger: Logger, appConfig: AppConfig, analytics?: GoogleSheetsAnalytics): Bot {
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required");
  }

  const bot = new Bot(token);

  const scheduledNextByChat = new Map<number, NodeJS.Timeout>();

  function scheduleNextPost(chatId: number, nextPostId: number) {
    if (nextPostId > 6) return;
    const existing = scheduledNextByChat.get(chatId);
    if (existing) clearTimeout(existing);
    const timeout = setTimeout(async () => {
      scheduledNextByChat.delete(chatId);
      try {
        await sendPost(chatId, nextPostId);
      } catch (err) {
        logger.error({ err, chatId, nextPostId }, "Failed to send scheduled next post");
      }
    }, 20_000);
    scheduledNextByChat.set(chatId, timeout);
    logger.info({ chatId, nextPostId }, "Scheduled next post in 20 seconds");
  }

  loadPostsConfig(appConfig.content.posts_file, "config/content/posts.schema.yaml")
    .then((cfg) => {
      logger.info({ posts: cfg.posts.length }, "Posts config loaded");
    })
    .catch((err) => {
      logger.error({ err }, "Failed to load posts config");
    });

  function trackedUrl(action: string, postId: number, to: string): string {
    const base = (appConfig.public_base_url ?? "").trim();
    // В dev/локально — не оборачиваем, чтобы Telegram не ругался на localhost
    if (!base || base.includes("localhost") || base.includes("127.0.0.1")) {
      return to;
    }
    let url: URL;
    try {
      url = new URL("/r", base);
    } catch {
      return to;
    }
    url.searchParams.set("action", action);
    url.searchParams.set("post", String(postId));
    url.searchParams.set("to", to);
    return url.toString();
  }

  async function logButtonClick(telegramId: number, username: string | undefined, postId: number, action: string) {
    if (analytics) {
      try {
        await analytics.logButtonClick(telegramId, username, postId, action);
      } catch (error) {
        logger.error({ error, telegramId, postId, action }, "Failed to log button click to Google Sheets");
      }
    }
  }

  function appendButton(kb: InlineKeyboard, btn: PostButton, postId: number) {
    switch (btn.action) {
      case "material":
        kb.text((btn as any).label, `material:${postId}`);
        break;
      case "support": {
        const to = (btn as any).url as string;
        const wrapped = trackedUrl(btn.action, postId, to);
        kb.url((btn as any).label, wrapped);
        break;
      }
      case "community":
        kb.text((btn as any).label, `community:${postId}`);
        break;
      case "payment":
        kb.text((btn as any).label, `payment:${postId}`);
        break;
      case "webinar": {
        const to = (btn as any).url as string;
        const wrapped = trackedUrl(btn.action, postId, to);
        kb.url((btn as any).label, wrapped);
        break;
      }
      case "jump":
        kb.text((btn as any).label, `jump:${postId}:${(btn as any).target_post}`);
        break;
      default:
        break;
    }
  }

  function buildKeyboardFromPost(post: PostConfig): InlineKeyboard {
    const kb = new InlineKeyboard();
    const buttons = post.buttons as PostButton[];

    buttons.forEach((b, i) => {
      appendButton(kb, b, post.id);
      if (i < buttons.length - 1) kb.row();
    });

    return kb;
  }

  // Retry функция для отправки сообщений
  async function sendWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
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

  async function sendPost(chatId: number, postId: number) {
    const startTime = Date.now();
    try {
      const cfg = await loadPostsConfig(
        appConfig.content.posts_file,
        "config/content/posts.schema.yaml",
      );
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
          await sendWithRetry(() => bot.api.sendPhoto(chatId, post.image!.url));
          await sendWithRetry(() => bot.api.sendMessage(chatId, caption, { 
            reply_markup: keyboard, 
            parse_mode: "HTML" 
          }));
        } catch (sendErr) {
          logger.warn({ err: sendErr, postId }, "Failed to send photo, sending text instead");
          errorCounter.labels("photo_send_failed").inc();
          await sendWithRetry(() => bot.api.sendMessage(chatId, caption, { 
            reply_markup: keyboard, 
            parse_mode: "HTML" 
          }));
        }
      } else {
        // Отправляем только текст, если нет валидного изображения
        await sendWithRetry(() => bot.api.sendMessage(chatId, caption, { 
          reply_markup: keyboard, 
          parse_mode: "HTML" 
        }));
      }

      // Увеличиваем счетчик отправленных постов
      postSentCounter.labels(postId.toString()).inc();
      
      const nextId = post.id + 1;
      if (nextId <= 6) {
        scheduleNextPost(chatId, nextId);
      }
    } catch (error) {
      logger.error({ error, chatId, postId }, "Failed to send post");
      errorCounter.labels("post_send_failed").inc();
      // Fallback сообщение
      try {
        await bot.api.sendMessage(chatId, 
          "Произошла ошибка при отправке поста. Попробуйте позже или обратитесь в поддержку.", 
          { parse_mode: "HTML" }
        );
      } catch (fallbackError) {
        logger.error({ fallbackError }, "Failed to send fallback message");
        errorCounter.labels("fallback_failed").inc();
      }
    } finally {
      // Записываем время отправки поста
      const duration = (Date.now() - startTime) / 1000;
      postSendDuration.labels(postId.toString()).inc(duration);
    }
  }

  bot.command("start", async (ctx) => {
    try {
      // Увеличиваем счетчик пользователей, начавших взаимодействие
      userStartCounter.inc();
      
      await logButtonClick(ctx.from?.id || 0, ctx.from?.username, 1, "start");
      await sendPost(ctx.chat.id, 1);
    } catch (err) {
      logger.error({ err }, "Failed to handle /start, falling back");
      errorCounter.labels("start_command_failed").inc();
      const keyboard = new InlineKeyboard().url(
        "Техподдержка",
        appConfig.support.contact_url,
      ).row();
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
      
      const cfg = await loadPostsConfig(
        appConfig.content.posts_file,
        "config/content/posts.schema.yaml",
      );
      const post = cfg.posts.find((p) => p.id === postId);
      const materialBtn = post?.buttons.find((b) => (b as any).action === "material") as any;
      const materialUrl = materialBtn?.url || "https://example.com";
      
      // Разные сообщения для разных постов
      let message: string;
      if (postId === 2) {
        message = `Подготовили для тебя видео. Если где-то не догоняешь, беги за Нейроходом! <a href="${materialUrl}">догнать</a>`;
      } else {
        message = `Нейроход дарит основу, с которой отправиться в поход по нейромиру будет значительно проще!\nСделай первый шаг <a href="${materialUrl}">сюда</a>`;
      }
      
      await ctx.answerCallbackQuery();
      await ctx.reply(message, { 
        parse_mode: "HTML", 
        link_preview_options: { is_disabled: true }
      });
    } catch (err) {
      logger.error({ err }, "material callback error");
      await ctx.answerCallbackQuery({ text: "Ошибка. Попробуйте позже.", show_alert: false });
    }
  });

  bot.callbackQuery(/^community:(\d+)/, async (ctx) => {
    try {
      const postId = Number(ctx.match?.[1]);
      await logButtonClick(ctx.from?.id || 0, ctx.from?.username, postId, "community");
      
      const cfg = await loadPostsConfig(
        appConfig.content.posts_file,
        "config/content/posts.schema.yaml",
      );
      const post = cfg.posts.find((p) => p.id === postId);
      const communityBtn = post?.buttons.find((b) => (b as any).action === "community") as any;
      const message = communityBtn?.message ??
        "Изучи материалы, которые мы собрали для тебя совершенно бесплатно. Тогда узнаешь как попасть в сообщество. Всего 5 постов";
      await ctx.answerCallbackQuery();
      await ctx.reply(message, { parse_mode: "HTML" });
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
