import UserService from '@/server/service/UserService';

const userService = new UserService();

export default defineWrappedResponseHandler(async (event) => {
    const ids: number[] = await readBody(event);

    const result = await userService.deleteUsers(ids);
    return defineOk({ msg: result.message });
});
