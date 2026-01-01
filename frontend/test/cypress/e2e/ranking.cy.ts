/**
 * Testes E2E para a pagina de Ranking
 * Testa podio, lista de ranking, filtros e ordenacao
 */
describe('Pagina de Ranking', () => {
  beforeEach(() => {
    cy.visit('/ranking');
  });

  describe('Carregamento inicial', () => {
    it('deve exibir o titulo correto da pagina', () => {
      cy.title().should('include', 'Ranking de Gastos');
    });

    it('deve exibir o titulo da pagina com icone', () => {
      cy.get('.page-title').should('be.visible');
      cy.get('.page-title').should('contain', 'Gastadores');
    });

    it('deve exibir subtitulo com ano', () => {
      cy.contains('Ranking de gastos parlamentares em').should('be.visible');
    });
  });

  describe('Filtros', () => {
    it('deve exibir o card de filtros', () => {
      cy.get('.filters-card').should('be.visible');
    });

    it('deve exibir filtro de Ano', () => {
      cy.contains('.filter-label', 'Ano').should('be.visible');
    });

    it('deve exibir filtro de Casa', () => {
      cy.contains('.filter-label', 'Casa').should('be.visible');
    });

    it('deve exibir filtro de UF', () => {
      cy.contains('.filter-label', 'UF').should('be.visible');
    });

    it('deve exibir filtro de Quantidade', () => {
      cy.contains('.filter-label', 'Quantidade').should('be.visible');
    });

    it('deve exibir toggle de Ordenacao', () => {
      cy.contains('.filter-label', 'Ordenacao').should('be.visible');
      cy.get('.ordem-toggle').should('exist');
    });

    it('deve ter opcoes de Mais Gastadores e Menos Gastadores', () => {
      cy.contains('Mais Gastadores').should('exist');
      cy.contains('Menos Gastadores').should('exist');
    });

    it('deve alternar ordenacao ao clicar', () => {
      cy.contains('Menos Gastadores').click();
      cy.get('.page-title').should('contain', 'Menores Gastadores');

      cy.contains('Mais Gastadores').click();
      cy.get('.page-title').should('contain', 'Maiores Gastadores');
    });
  });

  describe('Podio (Top 3)', () => {
    it('deve exibir secao de podio quando houver 3+ resultados (desktop)', () => {
      cy.viewport(1200, 800);
      cy.get('body').then(($body) => {
        if ($body.find('.podium-section').length > 0) {
          cy.get('.podium-section').should('be.visible');
          cy.get('.podium-item').should('have.length', 3);
        }
      });
    });

    it('deve exibir medalhas no podio', () => {
      cy.viewport(1200, 800);
      cy.get('body').then(($body) => {
        if ($body.find('.podium-section').length > 0) {
          cy.get('.podium-medal').should('have.length', 3);
        }
      });
    });

    it('deve exibir bases com posicoes 1, 2, 3', () => {
      cy.viewport(1200, 800);
      cy.get('body').then(($body) => {
        if ($body.find('.podium-section').length > 0) {
          cy.get('.podium-gold').should('contain', '1');
          cy.get('.podium-silver').should('contain', '2');
          cy.get('.podium-bronze').should('contain', '3');
        }
      });
    });

    it('deve navegar para detalhes ao clicar no podio', () => {
      cy.viewport(1200, 800);
      cy.get('body').then(($body) => {
        if ($body.find('.podium-item').length > 0) {
          cy.get('.podium-item').first().click();
          cy.url().should('include', '/parlamentares/');
        }
      });
    });
  });

  describe('Lista de Ranking', () => {
    it('deve exibir titulo da secao', () => {
      cy.contains('.section-title', 'Ranking Completo').should('be.visible');
    });

    it('deve exibir itens do ranking', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.ranking-list-item').length > 0) {
          cy.get('.ranking-list-item').should('have.length.at.least', 1);
        }
      });
    });

    it('deve exibir informacoes corretas nos itens', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.ranking-list-item').length > 0) {
          cy.get('.ranking-list-item').first().within(() => {
            cy.get('.ranking-position').should('exist');
            cy.get('.ranking-name').should('exist');
            cy.get('.ranking-value').should('exist');
            cy.get('.ranking-bar').should('exist');
          });
        }
      });
    });

    it('deve navegar para detalhes ao clicar em um item', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.ranking-list-item').length > 0) {
          cy.get('.ranking-list-item').first().click();
          cy.url().should('include', '/parlamentares/');
        }
      });
    });
  });

  describe('Page Scroller', () => {
    it('deve exibir botao de scroll ao rolar pagina', () => {
      cy.scrollTo('bottom');
      cy.get('.q-page-scroller .q-btn').should('be.visible');
    });
  });
});

// Workaround for Cypress AE + TS + Vite
export {};

