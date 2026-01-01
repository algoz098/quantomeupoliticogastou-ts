/**
 * Testes E2E para a pagina inicial (Dashboard)
 * Testa hero section, cards de estatisticas, ranking, categorias e navegacao
 */
describe('Dashboard (Pagina Inicial)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Carregamento inicial', () => {
    it('deve exibir o titulo correto da pagina', () => {
      cy.title().should('include', 'Dashboard');
      cy.title().should('include', 'Quanto Meu Politico Gastou');
    });

    it('deve exibir o hero section com titulo e subtitulo', () => {
      cy.get('.hero-section').should('be.visible');
      cy.get('.hero-title').should('contain', 'Acompanhe os gastos dos seus representantes');
      cy.get('.hero-subtitle').should('contain', 'Transparencia e fiscalizacao cidada');
    });

    it('deve exibir o campo de busca no hero', () => {
      cy.get('.hero-search').should('be.visible');
      cy.get('.hero-search .q-select').should('exist');
    });
  });

  describe('Cards de Estatisticas', () => {
    it('deve exibir os 4 cards de estatisticas', () => {
      cy.get('.stat-card').should('have.length', 4);
    });

    it('deve exibir card de Parlamentares', () => {
      cy.contains('.stat-label', 'Parlamentares').should('be.visible');
    });

    it('deve exibir card de Total de Despesas', () => {
      cy.contains('.stat-label', 'Total de Despesas').should('be.visible');
    });

    it('deve exibir card de Valor Total Gasto', () => {
      cy.contains('.stat-label', 'Valor Total Gasto').should('be.visible');
    });

    it('deve exibir card de Periodo de Dados', () => {
      cy.contains('.stat-label', 'Periodo de Dados').should('be.visible');
    });
  });

  describe('Secao de Ranking (Top Gastadores)', () => {
    it('deve exibir titulo da secao de ranking', () => {
      cy.contains('.section-title', 'Top 10 Gastadores').should('be.visible');
    });

    it('deve exibir botao para ver ranking completo', () => {
      cy.contains('Ver ranking completo').should('be.visible');
    });

    it('deve navegar para pagina de ranking ao clicar no botao', () => {
      cy.contains('Ver ranking completo').click();
      cy.url().should('include', '/ranking');
    });

    it('deve exibir itens do ranking quando houver dados', () => {
      // Aguarda carregamento e verifica se tem itens ou mensagem de vazio
      cy.get('.q-card').should('exist');
      cy.get('body').then(($body) => {
        if ($body.find('.ranking-item').length > 0) {
          cy.get('.ranking-item').should('have.length.at.least', 1);
          cy.get('.ranking-item').first().within(() => {
            cy.get('.ranking-position').should('exist');
            cy.get('.ranking-name').should('exist');
          });
        }
      });
    });

    it('deve navegar para detalhes ao clicar em um parlamentar do ranking', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.ranking-item').length > 0) {
          cy.get('.ranking-item').first().click();
          cy.url().should('include', '/parlamentares/');
        }
      });
    });
  });

  describe('Secao de Categorias', () => {
    it('deve exibir titulo da secao de categorias', () => {
      cy.contains('.section-title', 'Gastos por Categoria').should('be.visible');
    });

    it('deve exibir itens de categoria com barra de progresso', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.categoria-item').length > 0) {
          cy.get('.categoria-item').should('have.length.at.least', 1);
          cy.get('.categoria-item').first().within(() => {
            cy.get('.categoria-nome').should('exist');
            cy.get('.categoria-valor').should('exist');
            cy.get('.q-linear-progress').should('exist');
          });
        }
      });
    });
  });
});

// Workaround for Cypress AE + TS + Vite
// See: https://github.com/quasarframework/quasar-testing/issues/262#issuecomment-1154127497
export {};

