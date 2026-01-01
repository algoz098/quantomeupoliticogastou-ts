import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'parlamentares', component: () => import('pages/ParlamentaresPage.vue') },
      { path: 'parlamentares/:id', component: () => import('pages/ParlamentarDetalhePage.vue') },
      { path: 'ranking', component: () => import('pages/RankingPage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
