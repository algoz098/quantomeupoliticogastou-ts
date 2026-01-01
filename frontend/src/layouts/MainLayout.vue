<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated class="app-header">
      <q-toolbar class="q-py-sm">
        <q-toolbar-title class="cursor-pointer row items-center no-wrap" @click="$router.push('/')">
          <div class="header-logo q-mr-sm">
            <q-icon name="account_balance" size="28px" />
          </div>
          <div class="column gt-xs">
            <span class="header-title">Quanto Meu Politico Gastou</span>
            <span class="header-subtitle">Transparencia em gastos parlamentares</span>
          </div>
        </q-toolbar-title>

        <!-- Navegacao Desktop -->
        <div class="nav-links gt-sm">
          <q-btn
            v-for="link in menuLinks"
            :key="link.to"
            :to="link.to"
            flat
            no-caps
            :label="link.title"
            :icon="link.icon"
            class="nav-link"
          />
        </div>

        <q-space />

        <!-- Filtro de Casa -->
        <div class="casa-filter gt-xs">
          <q-select
            v-model="selectedCasa"
            :options="casaOptions"
            dense
            borderless
            emit-value
            map-options
            options-dense
            dark
            class="casa-select"
          >
            <template v-slot:prepend>
              <q-icon name="domain" size="xs" />
            </template>
          </q-select>
        </div>

        <!-- Link GitHub -->
        <q-btn
          flat
          dense
          round
          icon="img:https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
          aria-label="GitHub"
          color="white"
          class="q-ml-md github-btn"
          href="https://github.com/algoz098/quantomeupoliticogastou-ts"
          target="_blank"
        >
          <q-tooltip>Ver no GitHub</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          color="white"
          class="lt-md q-ml-xs"
          @click="showMobileMenu = !showMobileMenu"
        />
      </q-toolbar>

      <!-- Menu mobile -->
      <q-slide-transition>
        <div v-if="showMobileMenu" class="mobile-menu lt-md">
          <q-list dense>
            <q-item
              v-for="link in menuLinks"
              :key="link.to"
              :to="link.to"
              clickable
              v-ripple
              @click="showMobileMenu = false"
            >
              <q-item-section avatar>
                <q-icon :name="link.icon" color="white" />
              </q-item-section>
              <q-item-section class="text-white">{{ link.title }}</q-item-section>
            </q-item>
            <q-separator dark class="q-my-sm" />
            <q-item>
              <q-item-section>
                <q-select
                  v-model="selectedCasa"
                  :options="casaOptions"
                  dense
                  borderless
                  emit-value
                  map-options
                  options-dense
                  dark
                  label="Casa Legislativa"
                  class="text-white"
                />
              </q-item-section>
            </q-item>
            <q-separator dark class="q-my-sm" />
            <q-item
              clickable
              v-ripple
              tag="a"
              href="https://github.com/algoz098/quantomeupoliticogastou-ts"
              target="_blank"
              @click="showMobileMenu = false"
            >
              <q-item-section avatar>
                <q-icon name="img:https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" color="white" />
              </q-item-section>
              <q-item-section class="text-white">GitHub</q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-slide-transition>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFiltersStore, type CasaFilter } from 'src/stores/filters.store';
import { CASA_OPTIONS_WITH_ALL } from 'src/utils/constants';

interface MenuLink {
  title: string;
  icon: string;
  to: string;
}

const menuLinks: MenuLink[] = [
  { title: 'Dashboard', icon: 'dashboard', to: '/' },
  { title: 'Parlamentares', icon: 'people', to: '/parlamentares' },
  { title: 'Ranking', icon: 'leaderboard', to: '/ranking' },
];

const casaOptions = CASA_OPTIONS_WITH_ALL;

const showMobileMenu = ref(false);
const filtersStore = useFiltersStore();

const selectedCasa = computed({
  get: () => filtersStore.casa.value,
  set: (value: CasaFilter) => filtersStore.setCasa(value),
});
</script>

<style lang="sass" scoped>
.header-logo
  background: rgba(255, 255, 255, 0.15)
  border-radius: 8px
  padding: 6px
  display: flex
  align-items: center
  justify-content: center

.header-title
  font-size: 1.1rem
  font-weight: 600
  line-height: 1.2

.header-subtitle
  font-size: 0.65rem
  opacity: 0.7
  line-height: 1

.nav-links
  display: flex
  gap: 4px
  margin-left: 24px

.nav-link
  color: rgba(255, 255, 255, 0.85)
  font-weight: 500
  font-size: 0.9rem
  border-radius: 8px
  padding: 8px 16px

  &:hover
    background: rgba(255, 255, 255, 0.1)
    color: white

  &.q-router-link--active
    background: rgba(255, 255, 255, 0.15)
    color: white

.casa-filter
  min-width: 140px

.casa-select
  color: white

  :deep(.q-field__native)
    color: white

  :deep(.q-field__append)
    color: rgba(255, 255, 255, 0.7)

.github-btn
  :deep(img)
    filter: invert(1)
    width: 24px
    height: 24px

.mobile-menu
  background: linear-gradient(135deg, #1a365d 0%, #0f172a 100%)
  padding: 8px 0
</style>
