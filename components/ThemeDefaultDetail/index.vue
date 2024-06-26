<template>
  <!-- ssr-browser  -->
  <Header></Header>
  <div
    style="--gpt-body-width: 100%"
    class="blog mx-auto p-4 xl:px-20 xl:max-w-screen-xl pb-10 pt-24 xl:pt-36"
  >
    <h3 class="text-center text-[var(--web-color-7)]">
      <NuxtLink :to="'/?categoryId=' + (article && article.categoryId)">{{
        article && article.categoryTitle
      }}</NuxtLink>
    </h3>
    <h1
      class="text-2xl font-bold text-center mt-16 xl:mt-16 xl:text-5xl !leading-normal tracking-wider"
    >
      {{ article && article.title }}
    </h1>

    <p class="text-center font-time mt-8">
      发布
      <span class="text-[var(--web-color-7)]">{{
        article && article.author
      }}</span>
      • 更新于
      {{ article && article.publishedAtDetails.month.english }}
      {{ article && article.publishedAtDetails.day }},
      {{ article && article.publishedAtDetails.year }} •
      {{ article && article.viewsCount }} 阅读
    </p>

    <div class="mt-16">
      <img
        class="w-full h-auto object-cover aspect-video"
        :src="useImageUrl(article ? article.cover : '')"
        alt=""
      />
    </div>
    <!-- 48px 32px 0 -->
    <section
      class="mt-2 leading-[1.6] tracking-[0.5px] xl:leading-[1.5] text-justify px-0 lg:px-8 pt-8"
    >
      <!-- <div v-if="appStore.ssr" v-html="article && article.content"></div> -->
      <BasePreview v-model="article.content"></BasePreview>
    </section>
    <p
      v-if="article && article.tagList"
      class="text-[var(--web-color-7)] mt-4 text-sm font-silka-medium flex px-0 lg:px-8"
    >
      <span v-for="(v, k) in tagList" :key="v"
        ><NuxtLink :to="'/?tagId=' + tagIdList[k]">{{ v }}</NuxtLink
        ><span v-if="k !== tagList.length - 1" class="mx-1"> • </span></span
      >
    </p>

    <!-- 编辑文章 -->
    <div class="flex justify-between mt-8 px-0 lg:px-8 items-end">
      <NuxtLink
        :to="'/admin/article/' + (article && article.id)"
        target="_blank"
        class="cursor-pointer text-[var(--web-color-7)] flex-1"
        ><t-icon name="edit"></t-icon> Edit this page
      </NuxtLink>
      <span
        class="text-sm text-[var(--web-color-13)] line-clamp-2 flex-1 text-end"
        >{{ article && article.updatedAt }}</span
      >
    </div>

    <!-- 上一篇下一篇 -->
    <div class="flex justify-between mt-6 px-0 lg:px-8" v-if="browser">
      <NuxtLink
        :to="'/blog/' + String(articleAdjacent.previouArticle.id)"
        class="hover:no-underline"
        v-if="articleAdjacent.previouArticle"
      >
        <div
          class="flex group flex-col border border-[var(--web-border-1)] border-solid p-4 rounded-md cursor-pointer hover:border-[var(--web-color-7)] transition duration-500 ease"
        >
          <span class="text-xs" style="color: rgba(235, 235, 245, 0.6)"
            >上一篇</span
          ><span
            class="w-28 xl:w-60 line-clamp-1 mt-2 group-hover:text-[var(--web-color-7)] transition duration-500 ease"
            >{{ articleAdjacent.previouArticle.title }}</span
          >
        </div>
      </NuxtLink>
      <div v-else></div>
      <NuxtLink
        :to="'/blog/' + String(articleAdjacent.nextArticle.id)"
        class="hover:no-underline"
        v-if="articleAdjacent.nextArticle"
      >
        <div
          class="flex group items-end flex-col border border-[var(--web-border-1)] border-solid p-4 rounded-md cursor-pointer hover:border-[var(--web-color-7)] transition duration-500 ease"
        >
          <span class="text-xs" style="color: rgba(235, 235, 245, 0.6)"
            >下一篇</span
          ><span
            class="w-28 xl:w-60 line-clamp-1 mt-2 group-hover:text-[var(--web-color-7)] transition duration-500 ease"
            >{{ articleAdjacent.nextArticle.title }}</span
          >
        </div>
      </NuxtLink>
      <div v-else></div>
    </div>

    <div
      class="mt-32 px-0 lg:px-8"
      style="--td-comp-size-xxxl: 44px; --td-comp-margin-xxl: 12px"
      v-if="isShowComment && browser"
    >
      <div class="flex flex-col items-end">
        <t-textarea
          placeholder="回复给文章..."
          v-model.trim="replyText"
        ></t-textarea>

        <!-- 登录了才能显示 -->
        <div class="mt-4" v-if="replyText">
          <t-popconfirm
            content="确认回复吗"
            @confirm="handleCommentReplyArticle"
          >
            <t-button>回复</t-button>
          </t-popconfirm>
        </div>
      </div>
      <ThemeDefaultComment
        :commentList
        @reply="handleCommentReply"
        @like="handleCommentLike"
        @expand="handleCommentExpand"
        @loadMorePidComment="handleLoadMorePidComment"
      ></ThemeDefaultComment>
      <div
        class="w-full flex justify-center mt-8"
        v-if="commentPage < commentTotalPages"
      >
        <span
          @click="handleLoadMoreComment"
          v-if="commentPage * commentLimit"
          class="bg-white text-black rounded-full px-6 py-4 hover:bg-[rgb(37,37,37)] hover:text-white transition duration-500 ease"
          >加载更多评论</span
        >
      </div>
    </div>

    <t-dialog
      v-model:visible="addReplyVisible"
      header="回复"
      :confirm-on-enter="true"
      :on-cancel="() => (addReplyVisible = false)"
      :on-close-btn-click="() => (addReplyVisible = false)"
      :on-overlay-click="() => (addReplyVisible = false)"
      :on-close="() => (addReplyVisible = false)"
      :on-confirm="handleAddReplyConfirm"
    >
      <t-form
        ref="addReplyForm"
        :data="addReplyFormData"
        :rules="addReplyFormRules"
        :colon="true"
        :label-align="'top'"
        @submit="handleAddReplySave"
      >
        <t-form-item name="content" label="回复内容">
          <t-input v-model="addReplyFormData.content" clearable> </t-input>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>

  <Footer :title="String(article && article.author)"></Footer>
  <Cursor :list="[]" :home="false" v-if="browser && isShowCursor"></Cursor>
</template>

<script setup lang="ts">
import { useWebArticleAdjacentApi } from "~/api/web/article";
import Header from "../ThemeDefault/header.vue";
import Footer from "../ThemeDefault/footer.vue";
import Cursor from "../ThemeDefault/cursor.vue";
import type Article from "~/server/models/Article";
import useImageUrl from "@/utils/imageUrl";
import useAppStore from "~/stores/appStore";
import { CONFIG_KEY } from "~/common/constants";
import { getValue } from "~/common/utils/siteConfigUtil";
import { defaultRowsPerPageOptions } from "~/constants";
import {
  useWebCommentArticlePageApi,
  useWebCommentPidPageApi,
  useWebCommentSubmitApi,
} from "~/api/web/comment";
import type Comment from "@/server/models/Comment";
import type { SubmitContext } from "tdesign-vue-next/es/form";
import useUserStore from "~/stores/userStore";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";

const emits = defineEmits(["loadMoreComment"])
const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
  articleAdjacent: {
    type: Object,
    required: true,
  },
  commentList: {
    type: Array,
    required: true,
  },

  commentPage: {
    type: Number,
    required: true,
  },
  commentLimit: {
    type: Number,
    required: true,
  },
  commentTotal: {
    type: Number,
    required: true,
  },
  commentTotalPages: {
    type: Number,
    required: true,
  },
});

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

const browser = computed(() => process.browser);
const isShowComment = ref(
  getValue(appStore.siteConfig, CONFIG_KEY.SITE.COMMENT)
);

const isShowCursor = ref(getValue(appStore.siteConfig, CONFIG_KEY.SITE.CURSOR));

const getPidComment = async (item: any) => {
  try {
    const _data = await useWebCommentPidPageApi({
      pid: item.id,
      page: item._page,
      limit: item._limit,
    });

    _data.data.map((comment) => {
      comment.children = [];
      item.children.push(comment);
      return comment;
    });

    item._total = _data.meta.totalItems;
    item._total_page = _data.meta.totalPages;
  } catch {
    item._page -= 1;
  } finally {
  }
};
const replyText = ref("");
const handleLoadMoreComment = () => {
  emits("loadMoreComment")
};
const handleLoadMorePidComment = async (c: Comment) => {
  c._page += 1;
  await getPidComment(c);
};
const handleCommentLike = async (c: Comment) => {
  if (!userStore.user.id) {
    MessagePlugin.warning("请登录后再试！");
    return;
  }
  try {
    await useWebCommentSubmitApi({
      id: c.id,
      likesCount: c.likesCount + 1,
    });
    c.likesCount += 1;
  } catch (e) {
    MessagePlugin.error("点赞失败");
  }
};
const handleCommentReply = async (id: number) => {
  handleAddReplyShow(id);
};
const validateLogin = () => {
  if (!userStore.user.id) {
    router.push("/admin/login/?redirect=" + encodeURIComponent(route.path));
    return;
  }
};
const handleCommentReplyArticle = async () => {
  validateLogin();
  const content = replyText.value;
  replyText.value = "";
  try {
    await useWebCommentSubmitApi({
      articleId: props.article.id,
      content,
    });
    MessagePlugin.success("回复成功");
  } catch (error) {
    console.log(error);
    MessagePlugin.error("回复失败");
  }
};

const handleCommentExpand = async (id: number) => {
  const comment = props.commentList.find((comment) => comment.id === id);
  if (comment.children.length !== 0) {
    comment.children = [];
    return;
  }
  if (comment) {
    // 清空
    comment.children = [];
    // 请求
    comment._page = 1;
    await getPidComment(comment);
  }
};

// 回复
const addReplyForm = ref(null);
const addReplyVisible = ref(false);
const addReplyFormData = ref({
  pid: 0,
  articleId: props.article.id,
  content: "",
});
const addReplyFormRules = ref({
  content: [{ required: true, message: "回复内容必填" }],
});
const handleAddReplyShow = (id: number) => {
  validateLogin();
  addReplyFormData.value = {
    pid: id,
    articleId: props.article.id,
    content: "",
  };
  addReplyVisible.value = true;
};
const handleAddReplyConfirm = () => {
  addReplyForm.value && addReplyForm.value.submit();
};
const handleAddReplySave = async ({
  validateResult,
  firstError,
}: SubmitContext) => {
  if (validateResult === true) {
    try {
      await useWebCommentSubmitApi(addReplyFormData.value);
      MessagePlugin.success("回复成功，等待审核");
      addReplyVisible.value = false;
    } catch (e) {
      MessagePlugin.error("回复失败");
    }
  } else {
    addReplyVisible.value = true;
    console.log("Validate Errors: ", firstError, validateResult);
    firstError && MessagePlugin.warning(firstError);
  }
};

const tagList = computed(() => props.article.tagList!.split(","));
const tagIdList = computed(() => props.article.tagIdList!.split(","));

onMounted(() => {
  // 修改网站标题
  if (props.article) {
    window.document.title = props.article.author + "-" + props.article.title;
  }

  // 隐藏滚动条
  const html = document.querySelector("html");
  if (html) {
    html.classList.add("scrollbar-hidden");
  }

  // 添加滚动特效
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
});
</script>
