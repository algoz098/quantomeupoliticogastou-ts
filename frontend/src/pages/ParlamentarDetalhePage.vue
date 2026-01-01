<template>
  <q-page class="detalhe-page">
    <!-- Hero Header do Parlamentar -->
    <div v-if="parlamentar" class="parlamentar-hero">
      <div class="hero-content q-pa-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="white"
          class="back-btn"
          @click="goBack"
        />

        <div class="row items-center q-col-gutter-lg">
          <div class="col-auto">
            <q-avatar size="120px" class="hero-avatar">
              <img v-if="parlamentar.foto_url" :src="parlamentar.foto_url" :alt="parlamentar.nome" @error="onImageError" />
              <q-icon v-else name="person" size="80px" color="grey-4" />
            </q-avatar>
          </div>
          <div class="col">
            <div class="parlamentar-badge-row q-mb-sm">
              <span :class="parlamentar.casa === 'camara' ? 'badge-deputado' : 'badge-senador'">
                {{ parlamentar.casa === 'camara' ? 'Deputado Federal' : 'Senador' }}
              </span>
            </div>
            <h1 class="parlamentar-nome q-mb-xs">{{ parlamentar.nome }}</h1>
            <div v-if="parlamentar.nome_civil && parlamentar.nome_civil !== parlamentar.nome" class="parlamentar-nome-civil q-mb-sm">
              {{ parlamentar.nome_civil }}
            </div>
            <div class="parlamentar-partido">
              <q-icon name="groups" size="xs" class="q-mr-xs" />
              {{ parlamentar.partido || 'Sem partido' }}
              <span class="q-mx-sm">|</span>
              <q-icon name="location_on" size="xs" class="q-mr-xs" />
              {{ parlamentar.uf || 'N/A' }}
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="row q-col-gutter-md q-mt-lg">
          <div class="col-12 col-sm-6 col-md-3">
            <div class="stat-mini-card">
              <q-icon name="payments" size="sm" class="stat-mini-icon text-negative" />
              <div class="stat-mini-content">
                <div class="stat-mini-value text-negative">{{ formatCurrency(parlamentar.total_gasto || 0) }}</div>
                <div class="stat-mini-label">Total Gasto</div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <div class="stat-mini-card">
              <q-icon name="receipt_long" size="sm" class="stat-mini-icon text-primary" />
              <div class="stat-mini-content">
                <div class="stat-mini-value text-primary">{{ formatNumber(parlamentar.total_despesas || 0) }}</div>
                <div class="stat-mini-label">Despesas</div>
              </div>
            </div>
          </div>
          <div v-if="parlamentar.email" class="col-12 col-sm-6 col-md-3">
            <div class="stat-mini-card">
              <q-icon name="email" size="sm" class="stat-mini-icon text-info" />
              <div class="stat-mini-content">
                <a :href="'mailto:' + parlamentar.email" class="stat-mini-value text-info stat-link">Contato</a>
                <div class="stat-mini-label">Email</div>
              </div>
            </div>
          </div>
          <div v-if="parlamentar.data_nascimento" class="col-12 col-sm-6 col-md-3">
            <div class="stat-mini-card">
              <q-icon :name="parlamentar.sexo === 'M' ? 'male' : 'female'" size="sm" class="stat-mini-icon text-secondary" />
              <div class="stat-mini-content">
                <div class="stat-mini-value text-secondary">{{ formatDate(parlamentar.data_nascimento) }}</div>
                <div class="stat-mini-label">Nascimento</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton do Hero -->
    <div v-else-if="loading" class="parlamentar-hero">
      <div class="hero-content q-pa-lg">
        <div class="row items-center q-col-gutter-lg">
          <div class="col-auto">
            <q-skeleton type="QAvatar" size="120px" />
          </div>
          <div class="col">
            <q-skeleton type="text" width="100px" class="q-mb-sm" />
            <q-skeleton type="text" width="250px" height="2rem" class="q-mb-xs" />
            <q-skeleton type="text" width="150px" />
          </div>
        </div>
      </div>
    </div>

    <div class="q-pa-md q-pa-md-lg">
      <!-- Filtro de Ano -->
      <q-card class="filters-card q-mb-lg">
        <q-card-section>
          <div class="row items-center">
            <div class="filter-label q-mr-md">Periodo:</div>
            <q-btn-toggle
              v-model="filters.ano"
              toggle-color="primary"
              :options="anoToggleOptions"
              rounded
              unelevated
              class="ano-toggle"
              @update:model-value="onAnoChange"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Estatisticas -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <!-- Gastos por Categoria -->
        <div class="col-12 col-lg-6">
          <q-card class="full-height">
            <q-card-section class="q-pb-none">
              <div class="section-title">
                <div class="section-icon">
                  <q-icon name="category" color="primary" />
                </div>
                Gastos por Categoria{{ filters.ano ? ` (${filters.ano})` : '' }}
              </div>
            </q-card-section>
            <q-card-section v-if="categorias.length > 0">
              <div v-for="cat in categorias.slice(0, 8)" :key="cat.categoria" class="categoria-item q-mb-md">
                <div class="row justify-between items-center q-mb-xs">
                  <div class="categoria-nome">{{ cat.categoria }}</div>
                  <div class="categoria-valor text-weight-bold">{{ formatCurrency(cat.total) }}</div>
                </div>
                <q-linear-progress
                  :value="cat.total / maxCategoriaTotal"
                  color="primary"
                  track-color="grey-3"
                  rounded
                  size="8px"
                />
                <div class="text-caption text-grey-6 q-mt-xs">{{ cat.quantidade }} despesas</div>
              </div>
            </q-card-section>
            <q-card-section v-else class="empty-state">
              <q-icon name="category" class="empty-icon" color="grey-4" />
              <div class="empty-title">Sem dados de categorias</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Gastos Mensais -->
        <div class="col-12 col-lg-6">
          <q-card class="full-height">
            <q-card-section class="q-pb-none">
              <div class="section-title">
                <div class="section-icon">
                  <q-icon name="calendar_month" color="accent" />
                </div>
                Gastos Mensais{{ filters.ano ? ` (${filters.ano})` : '' }}
              </div>
            </q-card-section>
            <q-card-section v-if="gastosMensais.length > 0">
              <div v-for="gasto in gastosMensais" :key="`${gasto.ano}-${gasto.mes}`" class="mensal-item q-mb-md">
                <div class="row justify-between items-center q-mb-xs">
                  <div class="mensal-mes">{{ getMesNome(gasto.mes) }}/{{ gasto.ano }}</div>
                  <div class="mensal-valor text-weight-bold">{{ formatCurrency(gasto.total) }}</div>
                </div>
                <q-linear-progress
                  :value="gasto.total / maxMensalTotal"
                  color="accent"
                  track-color="grey-3"
                  rounded
                  size="8px"
                />
                <div class="text-caption text-grey-6 q-mt-xs">{{ gasto.quantidade }} despesas</div>
              </div>
            </q-card-section>
            <q-card-section v-else class="empty-state">
              <q-icon name="calendar_month" class="empty-icon" color="grey-4" />
              <div class="empty-title">Sem dados mensais</div>
              <div v-if="filters.ano" class="empty-description">para {{ filters.ano }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Despesas Detalhadas -->
      <q-card>
        <q-card-section class="q-pb-sm">
          <div class="row items-center justify-between">
            <div class="section-title q-mb-none">
              <div class="section-icon">
                <q-icon name="list_alt" color="secondary" />
              </div>
              Despesas Detalhadas
            </div>
            <div v-if="totalDespesas > 0" class="text-caption text-grey-6">
              {{ totalDespesas }} despesas encontradas
            </div>
          </div>
        </q-card-section>

        <!-- Filtros de Despesas -->
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="filter-label">Mes</div>
              <q-select
                v-model="filters.mes"
                :options="mesOptions"
                dense
                outlined
                emit-value
                map-options
                clearable
                placeholder="Todos os meses"
                @update:model-value="onFilterChange"
              >
                <template v-slot:prepend>
                  <q-icon name="event" color="grey-6" />
                </template>
              </q-select>
            </div>
            <div class="col-12 col-sm-6">
              <div class="filter-label">Categoria</div>
              <q-select
                v-model="filters.categoria"
                :options="categoriaOptions"
                dense
                outlined
                emit-value
                map-options
                clearable
                placeholder="Todas as categorias"
                @update:model-value="onFilterChange"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="grey-6" />
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>

        <!-- Tabela de Despesas -->
        <q-table
          :rows="despesas"
          :columns="despesaColumns"
          row-key="id"
          :loading="loadingDespesas"
          flat
          :rows-per-page-options="[20, 50, 100]"
          v-model:pagination="tablePagination"
          :rows-number="totalDespesas"
          @request="onTableRequest"
        >
          <template v-slot:body-cell-valor="props">
            <q-td :props="props" class="text-bold text-negative">
              {{ formatCurrency(props.value) }}
            </q-td>
          </template>
          <template v-slot:body-cell-data="props">
            <q-td :props="props">
              {{ props.value ? formatDate(props.value) : '-' }}
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="empty-state q-py-xl">
              <q-icon name="search_off" class="empty-icon" color="grey-4" />
              <div class="empty-title">Nenhuma despesa encontrada</div>
              <div class="empty-description">Tente ajustar os filtros selecionados</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-inner-loading :showing="loading" />

    <q-page-scroller position="bottom-right" :scroll-offset="300" :offset="[18, 18]">
      <q-btn fab icon="keyboard_arrow_up" color="primary" class="shadow-8" />
    </q-page-scroller>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMeta } from 'quasar';
import { apiService } from 'src/services/api.service';
import type { ParlamentarDetalhado, Despesa, CategoriaGasto, GastoMensal } from 'src/types/api';
import type { QTableColumn } from 'quasar';
import { formatCurrency, formatNumber, formatDate, getMesNome, handleImageError } from 'src/utils/formatters';
import { notifyError } from 'src/utils/notify';
import { useFiltersStore } from 'src/stores/filters.store';
import { AbortableRequest } from 'src/utils/abortable';
import { ANO_ATUAL } from 'src/utils/constants';

const onImageError = handleImageError;

// Titulo dinamico baseado no parlamentar carregado
const pageTitle = ref('Carregando... - Quanto Meu Politico Gastou');
useMeta(() => ({ title: pageTitle.value }));

const abortableParlamentar = new AbortableRequest();
const abortableCategorias = new AbortableRequest();
const abortableGastosMensais = new AbortableRequest();
const abortableDespesas = new AbortableRequest();

const route = useRoute();
const filtersStore = useFiltersStore();
const loading = ref(false);
const loadingDespesas = ref(false);
const parlamentar = ref<ParlamentarDetalhado | null>(null);
const despesas = ref<Despesa[]>([]);
const totalDespesas = ref(0);
const categorias = ref<CategoriaGasto[]>([]);
const gastosMensais = ref<GastoMensal[]>([]);

const filters = ref({ ano: null as number | null, mes: null as number | null, categoria: null as string | null });

const tablePagination = ref({ page: 1, rowsPerPage: 20, rowsNumber: 0 });

// Usar anos do store global, com fallback para geracao local
const anosDisponiveis = computed(() => {
  const anosDoStore = filtersStore.anosDisponiveis.value;
  if (anosDoStore.length > 0) {
    return anosDoStore;
  }
  // Fallback: gerar ultimos 6 anos
  return Array.from({ length: 6 }, (_, i) => ANO_ATUAL - i);
});

const anoToggleOptions = computed(() => [
  { label: 'Todos', value: null },
  ...anosDisponiveis.value.map(a => ({ label: String(a), value: a })),
]);
const mesOptions = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => ({ label: m, value: i + 1 }));
const categoriaOptions = ref<{ label: string; value: string }[]>([]);

const maxCategoriaTotal = computed(() => Math.max(...categorias.value.map(c => c.total), 1));
const maxMensalTotal = computed(() => Math.max(...gastosMensais.value.map(g => g.total), 1));

const despesaColumns: QTableColumn[] = [
  { name: 'data', label: 'Data', field: 'data', align: 'left', sortable: true },
  { name: 'categoria', label: 'Categoria', field: 'categoria', align: 'left', sortable: true },
  { name: 'fornecedor_nome', label: 'Fornecedor', field: 'fornecedor_nome', align: 'left' },
  { name: 'valor', label: 'Valor', field: 'valor', align: 'right', sortable: true },
];

const router = useRouter();

function goBack() {
  router.back();
}

async function loadParlamentar() {
  try {
    const id = route.params.id as string;
    const response = await apiService.getParlamentar(id, abortableParlamentar.getConfig());
    parlamentar.value = response.data;
    // Atualizar titulo da pagina
    if (parlamentar.value) {
      pageTitle.value = `${parlamentar.value.nome} - Quanto Meu Politico Gastou`;
    }
  } catch (error) {
    if (AbortableRequest.isAbortError(error)) return;
    console.error('Erro ao carregar parlamentar:', error);
    notifyError('Parlamentar nao encontrado. Verifique se o ID esta correto.');
    void router.push('/parlamentares');
  }
}

async function loadCategorias() {
  try {
    const id = route.params.id as string;
    const ano = filters.value.ano ?? undefined;
    const response = await apiService.getParlamentarCategorias(id, ano, abortableCategorias.getConfig());
    categorias.value = response.data;
    categoriaOptions.value = response.data.map(c => ({ label: c.categoria, value: c.categoria }));
  } catch (error) {
    if (AbortableRequest.isAbortError(error)) return;
    console.error('Erro ao carregar categorias:', error);
  }
}

async function loadGastosMensais() {
  try {
    const id = route.params.id as string;
    const ano = filters.value.ano ?? undefined;
    const response = await apiService.getParlamentarGastosMensais(id, ano, abortableGastosMensais.getConfig());
    gastosMensais.value = response.data;
  } catch (error) {
    if (AbortableRequest.isAbortError(error)) return;
    console.error('Erro ao carregar gastos mensais:', error);
  }
}

async function loadDespesas(page = 1, rowsPerPage = 20) {
  loadingDespesas.value = true;
  try {
    const id = route.params.id as string;
    const despesaFilters: { ano?: number; mes?: number; categoria?: string; page?: number; limit?: number } = {
      page,
      limit: rowsPerPage,
    };
    if (filters.value.ano !== null) despesaFilters.ano = filters.value.ano;
    if (filters.value.mes !== null) despesaFilters.mes = filters.value.mes;
    if (filters.value.categoria !== null) despesaFilters.categoria = filters.value.categoria;

    const response = await apiService.getParlamentarDespesas(id, despesaFilters, abortableDespesas.getConfig());
    despesas.value = response.data;
    totalDespesas.value = response.total;
    tablePagination.value.rowsNumber = response.total;
  } catch (error) {
    if (AbortableRequest.isAbortError(error)) return;
    console.error('Erro ao carregar despesas:', error);
    notifyError('Erro ao carregar despesas');
  } finally {
    loadingDespesas.value = false;
  }
}

function onTableRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  const { page, rowsPerPage } = props.pagination;
  tablePagination.value.page = page;
  tablePagination.value.rowsPerPage = rowsPerPage;
  void loadDespesas(page, rowsPerPage);
}

async function onAnoChange() {
  // Resetar filtros dependentes e paginacao quando o ano muda
  filters.value.mes = null;
  filters.value.categoria = null;
  tablePagination.value.page = 1;
  await Promise.all([loadCategorias(), loadGastosMensais(), loadDespesas()]);
}

async function onFilterChange() {
  // Resetar paginacao ao mudar filtros
  tablePagination.value.page = 1;
  await loadDespesas();
}

onMounted(async () => {
  loading.value = true;
  await Promise.all([loadParlamentar(), loadCategorias(), loadGastosMensais(), loadDespesas()]);
  loading.value = false;
});

onBeforeUnmount(() => {
  abortableParlamentar.abort();
  abortableCategorias.abort();
  abortableGastosMensais.abort();
  abortableDespesas.abort();
});
</script>

<style lang="sass" scoped>
.detalhe-page
  background: transparent

// Hero Section
.parlamentar-hero
  background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%)
  color: white
  position: relative
  overflow: hidden

  &::before
    content: ''
    position: absolute
    top: 0
    right: 0
    width: 50%
    height: 100%
    background: radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)

.hero-content
  position: relative
  z-index: 1

.back-btn
  position: absolute
  top: 16px
  left: 16px

.hero-avatar
  border: 4px solid rgba(255, 255, 255, 0.3)
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2)
  background: white

.parlamentar-badge-row
  display: flex
  gap: 8px

.parlamentar-nome
  font-size: 2rem
  font-weight: 700
  margin: 0
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)

.parlamentar-nome-civil
  font-size: 0.95rem
  opacity: 1
  font-weight: 400

.parlamentar-partido
  font-size: 1rem
  opacity: 1
  display: flex
  align-items: center
  font-weight: 500

// Mini Stats Cards
.stat-mini-card
  background: rgba(255, 255, 255, 0.15)
  backdrop-filter: blur(10px)
  border-radius: 12px
  padding: 16px
  display: flex
  align-items: center
  gap: 12px

.stat-mini-icon
  opacity: 0.9

.stat-mini-content
  flex: 1

.stat-mini-value
  font-weight: 700
  font-size: 1rem

.stat-mini-label
  font-size: 0.8rem
  opacity: 1
  font-weight: 400

.stat-link
  text-decoration: none

  &:hover
    text-decoration: underline

// Filters
.filter-label
  font-size: 0.8rem
  text-transform: uppercase
  letter-spacing: 0.5px
  color: #4b5563
  margin-bottom: 6px
  font-weight: 600

.ano-toggle
  :deep(.q-btn)
    padding: 6px 12px
    font-size: 0.8rem

// Categoria Items
.categoria-item
  padding: 10px 0

.categoria-nome
  font-size: 0.9rem
  color: #374151
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  max-width: 60%
  font-weight: 500

.categoria-valor
  font-size: 0.9rem
  color: #1a365d
  font-weight: 600

// Mensal Items
.mensal-item
  padding: 10px 0

.mensal-mes
  font-size: 0.9rem
  color: #374151
  font-weight: 500

.mensal-valor
  font-size: 0.9rem
  color: #1a365d
  font-weight: 600

@media (max-width: 599px)
  .parlamentar-nome
    font-size: 1.5rem

  .hero-avatar
    width: 80px !important
    height: 80px !important

  .stat-mini-card
    padding: 12px

  .stat-mini-value
    font-size: 0.875rem

  .back-btn
    top: 8px
    left: 8px
</style>

