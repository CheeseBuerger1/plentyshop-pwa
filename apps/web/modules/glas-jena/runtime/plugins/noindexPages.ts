import { getPageRobots } from '../utils/noindexPages';

/*
 * `noindex, nofollow` on the function pages of NOINDEX_PAGE_NAMES. Set with a high priority so it wins over the shop's
 * robots default from app.vue; on all other pages the value is empty and the shop's robots apply.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter();

  const robots = computed(() => getPageRobots(router.currentRoute.value.name));

  useSeoMeta({ robots: () => robots.value }, { tagPriority: 'high' });
});
