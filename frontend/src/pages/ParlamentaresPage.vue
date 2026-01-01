<template>
  <q-page class="parlamentares-page q-pa-md q-pa-md-lg">
    <!-- Header da Pagina -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="page-title q-mb-xs">Parlamentares</h1>
        <p class="text-grey-6 q-mb-none">Deputados e Senadores do Congresso Nacional</p>
      </div>
      <div class="row items-center q-gutter-sm">
        <!-- Toggle de visualizacao -->
        <q-btn-toggle
          v-model="viewMode"
          toggle-color="primary"
          :options="[
            { icon: 'view_list', value: 'list' },
            { icon: 'grid_view', value: 'grid' }
          ]"
          unelevated
          rounded
          class="view-toggle"
        />
      </div>
    </div>

    <!-- Filtros Modernos -->
    <q-card class="filters-card q-mb-lg">
      <q-card-section>
        <div class="row items-center q-mb-sm">
          <q-icon name="filter_alt" color="primary" size="sm" class="q-mr-sm" />
          <span class="text-weight-medium text-grey-8">Filtros</span>
          <q-space />
          <q-btn
            v-if="hasActiveFilters"
            flat
            dense
            color="negative"
            label="Limpar filtros"
            icon="clear"
            no-caps
            @click="clearFilters"
          />
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="filter-label">Nome</div>
            <q-input
              v-model="filters.nome"
              placeholder="Buscar por nome..."
              dense
              outlined
              clearable
              debounce="500"
              @update:model-value="onFilterChange"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="grey-6" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="filter-label">Casa Legislativa</div>
            <q-select
              v-model="filters.casa"
              :options="casaOptions"
              dense
              outlined
              emit-value
              map-options
              clearable
              placeholder="Todas"
              @update:model-value="onFilterChange"
            >
              <template v-slot:prepend>
                <q-icon name="domain" color="grey-6" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="filter-label">Estado (UF)</div>
            <q-select
              v-model="filters.uf"
              :options="ufOptions"
              dense
              outlined
              emit-value
              map-options
              clearable
              placeholder="Todos"
              @update:model-value="onFilterChange"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" color="grey-6" />
              </template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="filter-label">Partido</div>
            <q-select
              v-model="filters.partido"
              :options="partidoOptions"
              dense
              outlined
              emit-value
              map-options
              clearable
              placeholder="Todos"
              @update:model-value="onFilterChange"
            >
              <template v-slot:prepend>
                <q-icon name="groups" color="grey-6" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Skeleton Loading - Grid -->
    <div v-if="loading && parlamentares.length === 0 && viewMode === 'grid'" class="row q-col-gutter-md">
      <div v-for="i in 8" :key="i" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="parlamentar-card-skeleton">
          <q-card-section class="text-center q-pb-none">
            <q-skeleton type="QAvatar" size="80px" class="q-mx-auto" />
          </q-card-section>
          <q-card-section class="text-center">
            <q-skeleton type="text" width="70%" class="q-mx-auto" />
            <q-skeleton type="text" width="50%" class="q-mx-auto q-mt-sm" />
            <q-skeleton type="text" width="40%" class="q-mx-auto q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Skeleton Loading - List -->
    <SkeletonList v-else-if="loading && parlamentares.length === 0 && viewMode === 'list'" :count="5" />

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid' && parlamentares.length > 0" class="row q-col-gutter-md">
      <div v-for="p in parlamentares" :key="p.id" class="col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card class="parlamentar-card card-hover-lift" @click="$router.push(`/parlamentares/${p.id}`)">
          <q-card-section class="text-center q-pb-sm">
            <q-avatar size="80px" class="avatar-bordered">
              <img v-if="p.foto_url" :src="p.foto_url" @error="onImageError" />
              <q-icon v-else name="person" size="lg" color="grey-5" />
            </q-avatar>
          </q-card-section>
          <q-card-section class="text-center q-pt-none">
            <div class="parlamentar-nome">{{ p.nome }}</div>
            <div class="parlamentar-info q-mt-xs">
              <span :class="p.casa === 'camara' ? 'badge-deputado' : 'badge-senador'">
                {{ p.casa === 'camara' ? 'Deputado' : 'Senador' }}
              </span>
            </div>
            <div class="parlamentar-partido q-mt-sm">
              <q-icon name="groups" size="xs" color="grey-5" class="q-mr-xs" />
              {{ p.partido || 'Sem partido' }}
              <span class="text-grey-5 q-mx-xs">|</span>
              <q-icon name="location_on" size="xs" color="grey-5" class="q-mr-xs" />
              {{ p.uf || 'N/A' }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- List View -->
    <q-card v-else-if="viewMode === 'list' && parlamentares.length > 0">
      <div class="parlamentares-list">
        <div
          v-for="p in parlamentares"
          :key="p.id"
          class="parlamentar-list-item"
          @click="$router.push(`/parlamentares/${p.id}`)"
        >
          <q-avatar size="56px" class="q-mr-md">
            <img v-if="p.foto_url" :src="p.foto_url" @error="onImageError" />
            <q-icon v-else name="person" size="md" color="grey-5" />
          </q-avatar>
          <div class="parlamentar-list-info">
            <div class="parlamentar-nome">{{ p.nome }}</div>
            <div class="parlamentar-partido">
              {{ p.partido || 'Sem partido' }} - {{ p.uf || 'N/A' }}
            </div>
          </div>
          <div class="parlamentar-list-badge">
            <span :class="p.casa === 'camara' ? 'badge-deputado' : 'badge-senador'">
              {{ p.casa === 'camara' ? 'Deputado' : 'Senador' }}
            </span>
          </div>
          <q-icon name="chevron_right" color="grey-4" size="sm" />
        </div>
      </div>
      <q-inner-loading :showing="loading && parlamentares.length > 0" />
    </q-card>

    <!-- Empty State -->
    <q-card v-if="parlamentares.length === 0 && !loading">
      <q-card-section class="empty-state">
        <q-icon name="search_off" class="empty-icon" color="grey-4" />
        <div class="empty-title">Nenhum parlamentar encontrado</div>
        <div class="empty-description">{{ emptyMessage || 'Tente ajustar os filtros de busca' }}</div>
        <q-btn
          v-if="hasActiveFilters"
          color="primary"
          label="Limpar filtros"
          icon="clear"
          no-caps
          outline
          class="q-mt-md"
          @click="clearFilters"
        />
      </q-card-section>
    </q-card>

    <!-- Paginacao -->
    <q-card v-if="parlamentares.length > 0" class="q-mt-md">
      <q-card-section class="row items-center justify-between">
        <div class="text-body2 text-grey-7">
          Mostrando <strong>{{ paginationInfo.start }}-{{ paginationInfo.end }}</strong> de <strong>{{ total }}</strong> parlamentares
        </div>
        <q-pagination
          v-model="page"
          :max="totalPages"
          :max-pages="7"
          direction-links
          boundary-links
          color="primary"
          active-color="primary"
          @update:model-value="onPageChange"
        />
      </q-card-section>
    </q-card>

    <q-page-scroller position="bottom-right" :scroll-offset="300" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="primary" class="shadow-8" />
    </q-page-scroller>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMeta } from 'quasar';
import { apiService } from 'src/services/api.service';
import type { Parlamentar, Casa } from 'src/types/api';
import { useFiltersStore } from 'src/stores/filters.store';
import { UF_OPTIONS, CASA_OPTIONS } from 'src/utils/constants';
import { handleImageError, buildEmptyMessage } from 'src/utils/formatters';
import { notifyError, notifyInfo } from 'src/utils/notify';
import { AbortableRequest } from 'src/utils/abortable';
import SkeletonList from 'src/components/SkeletonList.vue';

useMeta({ title: 'Parlamentares - Quanto Meu Politico Gastou' });

const router = useRouter();
const filtersStore = useFiltersStore();
const abortableRequest = new AbortableRequest();
const abortablePartidos = new AbortableRequest();

const loading = ref(false);
const parlamentares = ref<Parlamentar[]>([]);
const total = ref(0);
const page = ref(1);
const limit = 20;
const viewMode = ref<'list' | 'grid'>('grid');

const filters = ref({
  nome: '',
  casa: filtersStore.casa.value as Casa | null,
  uf: null as string | null,
  partido: null as string | null,
});

const hasActiveFilters = computed(() => {
  return !!(filters.value.nome || filters.value.casa || filters.value.uf || filters.value.partido);
});

function clearFilters() {
  filters.value.nome = '';
  filters.value.casa = null;
  filters.value.uf = null;
  filters.value.partido = null;
  void loadData(true);
}

watch(() => filtersStore.casa.value, (newCasa, oldCasa) => {
  filters.value.casa = newCasa;
  page.value = 1;
  void loadData();
  if (oldCasa !== undefined && newCasa !== oldCasa) {
    const casaLabel = newCasa === 'camara' ? 'Camara' : newCasa === 'senado' ? 'Senado' : 'Todas as casas';
    notifyInfo(`Filtro alterado para: ${casaLabel}`);
  }
});

const casaOptions = CASA_OPTIONS;
const ufOptions = UF_OPTIONS;

const partidoOptions = ref<{ label: string; value: string }[]>([]);

const totalPages = computed(() => Math.ceil(total.value / limit));

const paginationInfo = computed(() => {
  const start = (page.value - 1) * limit + 1;
  const end = Math.min(page.value * limit, total.value);
  return { start, end };
});

async function loadData(resetPage = false) {
  if (resetPage) {
    page.value = 1;
  }
  loading.value = true;
  try {
    const response = await apiService.getParlamentares({
      nome: filters.value.nome || undefined,
      casa: filters.value.casa as 'camara' | 'senado' | undefined,
      uf: filters.value.uf || undefined,
      partido: filters.value.partido || undefined,
      page: page.value,
      limit,
    }, abortableRequest.getConfig());
    parlamentares.value = response.data;
    total.value = response.total;
  } catch (error) {
    if (AbortableRequest.isAbortError(error)) {
      return;
    }
    console.error('Erro ao carregar parlamentares:', error);
    notifyError('Erro ao carregar parlamentares');
  } finally {
    loading.value = false;
  }
}

const emptyMessage = computed(() => buildEmptyMessage(filters.value));

function onFilterChange() {
  void loadData(true);
}

function onPageChange() {
  void loadData();
}

const onImageError = handleImageError;

async function loadPartidos() {
  try {
    const response = await apiService.getPartidos(abortablePartidos.getConfig());
    partidoOptions.value = response.data.map(p => ({ label: p.sigla, value: p.sigla }));
  } catch (error) {
    if (AbortableRequest.isAbortError(error)) {
      return;
    }
    console.error('Erro ao carregar partidos:', error);
    notifyError('Erro ao carregar partidos');
  }
}

onMounted(async () => {
  await Promise.all([loadData(), loadPartidos()]);
});

onBeforeUnmount(() => {
  abortableRequest.abort();
  abortablePartidos.abort();
});

defineExpose({ router });
</script>

<style lang="sass" scoped>
.parlamentares-page
  background: transparent

.view-toggle
  :deep(.q-btn)
    padding: 8px 12px

.filters-card
  border-radius: 16px

  .filter-label
    font-size: 0.8rem
    text-transform: uppercase
    letter-spacing: 0.5px
    color: #4b5563
    margin-bottom: 6px
    font-weight: 600

.parlamentar-card-skeleton,
.parlamentar-card
  border-radius: 16px
  cursor: pointer
  height: 100%

.parlamentar-card
  transition: all 0.2s ease

  &:hover
    border-color: rgba(26, 54, 93, 0.2)

.avatar-bordered
  border: 3px solid #e5e7eb

.parlamentar-nome
  font-size: 1rem
  font-weight: 600
  color: #1a365d
  line-height: 1.3

.parlamentar-info
  margin-top: 4px

.parlamentar-partido
  font-size: 0.85rem
  color: #4b5563
  display: flex
  align-items: center
  justify-content: center
  flex-wrap: wrap
  font-weight: 500

.parlamentares-list
  display: flex
  flex-direction: column

.parlamentar-list-item
  display: flex
  align-items: center
  padding: 16px 20px
  cursor: pointer
  transition: background 0.2s ease
  border-bottom: 1px solid #f1f5f9

  &:last-child
    border-bottom: none

  &:hover
    background: #f8fafc

.parlamentar-list-info
  flex: 1
  min-width: 0

  .parlamentar-nome
    font-size: 1rem

  .parlamentar-partido
    justify-content: flex-start
    margin-top: 2px

.parlamentar-list-badge
  margin-right: 12px

@media (max-width: 599px)
  .view-toggle
    display: none

  .parlamentar-list-item
    padding: 12px 16px
</style>

