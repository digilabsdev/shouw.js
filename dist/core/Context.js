"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const discord_js_1 = require("discord.js");
class Context {
    args;
    channel;
    user;
    member;
    guild;
    message;
    interaction;
    constructor(ctx, args) {
        this.interaction = ctx instanceof discord_js_1.Message ? void 0 : ctx;
        this.user = ctx instanceof discord_js_1.Message ? ctx.author : ctx.user;
        this.message = ctx instanceof discord_js_1.Message ? ctx : void 0;
        this.channel = ctx.channel;
        this.args = args ?? [];
        this.member = ctx.member;
        this.guild = ctx.guild;
    }
    get isInteraction() {
        return (!!this.interaction &&
            (this.interaction instanceof discord_js_1.ChatInputCommandInteraction ||
                this.interaction instanceof discord_js_1.MessageComponentInteraction ||
                this.interaction instanceof discord_js_1.ModalSubmitInteraction ||
                this.interaction instanceof discord_js_1.ContextMenuCommandInteraction));
    }
    get isReplied() {
        if (!this.isInteraction)
            return false;
        return (this.interaction?.replied || this.interaction?.deferred) ?? false;
    }
    async send(data) {
        if (this.isInteraction && !this.isReplied)
            return await this.reply(data);
        if (!this.channel)
            return void 0;
        if (this.channel.partial)
            await this.channel.fetch();
        return await this.channel.send(data);
    }
    async reply(data) {
        if (this.isInteraction && this.interaction && !this.isReplied)
            return await this.interaction.reply(data);
        if (!this.message)
            return await this.send(data);
        if (this.message.partial)
            await this.message.fetch();
        return await this.message.reply(data);
    }
    async editReply(data) {
        return await this.interaction?.editReply(data);
    }
    async deleteReply() {
        return await this.interaction?.deleteReply();
    }
    async fetchReply() {
        return await this.interaction?.fetchReply();
    }
    async deferReply(ephemeral = false) {
        return await this.interaction?.deferReply({
            flags: ephemeral ? 64 : void 0,
            withResponse: true
        });
    }
    async followUp(data) {
        return await this.interaction?.followUp(data);
    }
    async deferUpdate() {
        if (!this.interaction?.isMessageComponent())
            return;
        return await this.interaction?.deferUpdate({ withResponse: true });
    }
    async update(data) {
        if (!this.interaction?.isMessageComponent())
            return;
        return await this.interaction?.update(data);
    }
}
exports.Context = Context;
