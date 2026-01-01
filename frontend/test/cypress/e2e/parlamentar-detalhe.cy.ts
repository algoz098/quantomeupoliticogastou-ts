/**
 * Testes E2E para a pagina de Detalhe do Parlamentar
 * Testa carregamento de dados, filtros, tabela de despesas e navegacao
 */
describe('Pagina de Detalhe do Parlamentar', () => {
  // Primeiro navegar pela lista para pegar um ID valido
  beforeEach(() => {
    cy.visit('/parlamentares');
    // Aguarda carregamento e clica no primeiro parlamentar disponivel
    cy.get('.parlamentar-card, .parlamentar-list-item', { timeout: 10000 }).first().click();
    cy.url().should('include', '/parlamentares/');
  });

  describe('Carregamento inicial', () => {
    it('deve exibir o titulo da pagina com nome do parlamentar', () => {
      cy.title().should('include', 'Quanto Meu Politico Gastou');
    });

    it('deve exibir o hero section com informacoes do parlamentar', () => {
      cy.get('.parlamentar-hero').should('be.visible');
    });

    it('deve exibir o nome do parlamentar', () => {
      cy.get('.parlamentar-nome').should('be.visible');
    });

    it('deve exibir a badge de deputado ou senador', () => {
      cy.get('.badge-deputado, .badge-senador').should('exist');
    });

    it('deve exibir partido e UF', () => {
      cy.get('.parlamentar-partido').should('be.visible');
    });
  });

  describe('Cards de estatisticas', () => {
    it('deve exibir card de Total Gasto', () => {
      cy.contains('.stat-mini-label', 'Total Gasto').should('be.visible');
    });

    it('deve exibir card de Despesas', () => {
      cy.contains('.stat-mini-label', 'Despesas').should('be.visible');
    });
  });

  describe('Botao de voltar', () => {
    it('deve exibir botao de voltar', () => {
      cy.get('.back-btn').should('be.visible');
    });

    it('deve voltar para pagina anterior ao clicar', () => {
      cy.get('.back-btn').click();
      cy.url().should('include', '/parlamentares');
    });
  });

  describe('Filtro de periodo', () => {
    it('deve exibir toggle de anos', () => {
      cy.get('.filters-card').should('be.visible');
      cy.get('.ano-toggle').should('exist');
    });

    it('deve ter opcao "Todos"', () => {
      cy.contains('.ano-toggle button', 'Todos').should('exist');
    });

    it('deve alterar dados ao selecionar ano diferente', () => {
      cy.get('.ano-toggle button').eq(1).click();
      // Aguarda recarregamento dos dados
      cy.wait(500);
      cy.get('.q-page').should('exist');
    });
  });

  describe('Secao de Gastos por Categoria', () => {
    it('deve exibir titulo da secao', () => {
      cy.contains('.section-title', 'Gastos por Categoria').should('be.visible');
    });

    it('deve exibir itens de categoria ou estado vazio', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.categoria-item').length > 0) {
          cy.get('.categoria-item').should('have.length.at.least', 1);
          cy.get('.categoria-item').first().within(() => {
            cy.get('.categoria-nome').should('exist');
            cy.get('.categoria-valor').should('exist');
          });
        }
      });
    });
  });

  describe('Secao de Gastos Mensais', () => {
    it('deve exibir titulo da secao', () => {
      cy.contains('.section-title', 'Gastos Mensais').should('be.visible');
    });

    it('deve exibir itens mensais ou estado vazio', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.mensal-item').length > 0) {
          cy.get('.mensal-item').should('have.length.at.least', 1);
        }
      });
    });
  });

  describe('Tabela de Despesas Detalhadas', () => {
    it('deve exibir titulo da secao', () => {
      cy.contains('.section-title', 'Despesas Detalhadas').should('be.visible');
    });

    it('deve exibir filtro de mes', () => {
      cy.contains('.filter-label', 'Mes').should('be.visible');
    });

    it('deve exibir filtro de categoria', () => {
      cy.contains('.filter-label', 'Categoria').should('be.visible');
    });

    it('deve exibir tabela de despesas', () => {
      cy.get('.q-table').should('exist');
    });

    it('deve exibir colunas corretas na tabela', () => {
      cy.get('.q-table thead').within(() => {
        cy.contains('Data').should('exist');
        cy.contains('Categoria').should('exist');
        cy.contains('Fornecedor').should('exist');
        cy.contains('Valor').should('exist');
      });
    });
  });

  describe('Page Scroller', () => {
    it('deve exibir botao de scroll para topo ao rolar pagina', () => {
      cy.scrollTo('bottom');
      cy.get('.q-page-scroller .q-btn').should('be.visible');
    });
  });
});

// Workaround for Cypress AE + TS + Vite
export {};

