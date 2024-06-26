import ArticleService from '@/server/service/ArticleService';

const articleService = new ArticleService();

export default defineWrappedResponseHandler(async (event) => {
    defineHasAuthority(event, "article:page")

    const query: ArticleQuery = getQuery(event);
    query.title = decodeURIComponent(query.title as string);
    if (event.context.user) {
        query.isSuperAdmin = event.context.user.superAdmin as number;
        query.userId = event.context.user.id as number;
    }
    const result = await articleService.selectPage(query);
    return defineOk({ data: result });
});
