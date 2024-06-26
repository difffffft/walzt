import ChatService from '@/server/service/ChatService';

const chatService = new ChatService();

export default defineWrappedResponseHandler(async (event) => {
    defineHasAuthority(event, "chat:delete")
    const ids: number[] = await readBody(event);
    const userId = event.context.user.id;
    await chatService.deleteChats(ids,userId);
    return defineOk({});
});