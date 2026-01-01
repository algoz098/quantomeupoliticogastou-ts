/**
 * Testes E2E para o Layout e Navegacao
 * Testa header, menu, navegacao entre paginas e busca de parlamentar
 */
describe('Layout e Navegacao', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Header', () => {
    it('deve exibir o header', () => {
      cy.get('.q-header').should('be.visible');
    });

    it('deve exibir o logo e titulo', () => {
      cy.get('.header-logo').should('be.visible');
      cy.get('.header-title').should('contain', 'Quanto Meu Politico Gastou');
    });

    it('deve exibir o subtitulo', () => {
      cy.get('.header-subtitle').should('contain', 'Transparencia em gastos parlamentares');
    });

    it('deve navegar para home ao clicar no logo', () => {
      cy.visit('/parlamentares');
      cy.get('.q-toolbar-title').click();
      cy.url().should('eq', Cypress.config().baseUrl);
    });
  });

  describe('Menu de Navegacao (Desktop)', () => {
    beforeEach(() => {
      cy.viewport(1200, 800);
    });

    it('deve exibir links de navegacao', () => {
      cy.get('.nav-links').should('be.visible');
    });

    it('deve exibir link Dashboard', () => {
      cy.get('.nav-link').contains('Dashboard').should('be.visible');
    });

    it('deve exibir link Parlamentares', () => {
      cy.get('.nav-link').contains('Parlamentares').should('be.visible');
    });

    it('deve exibir link Ranking', () => {
      cy.get('.nav-link').contains('Ranking').should('be.visible');
    });

    it('deve navegar para Dashboard', () => {
      cy.get('.nav-link').contains('Dashboard').click();
      cy.url().should('eq', Cypress.config().baseUrl);
    });

    it('deve navegar para Parlamentares', () => {
      cy.get('.nav-link').contains('Parlamentares').click();
      cy.url().should('include', '/parlamentares');
    });

    it('deve navegar para Ranking', () => {
      cy.get('.nav-link').contains('Ranking').click();
      cy.url().should('include', '/ranking');
    });

    it('deve destacar link ativo', () => {
      cy.get('.nav-link').contains('Dashboard').should('have.class', 'q-router-link--active');
      cy.get('.nav-link').contains('Parlamentares').click();
      cy.get('.nav-link').contains('Parlamentares').should('have.class', 'q-router-link--active');
    });
  });

  describe('Filtro de Casa Legislativa', () => {
    beforeEach(() => {
      cy.viewport(1200, 800);
    });

    it('deve exibir o seletor de casa', () => {
      cy.get('.casa-filter').should('be.visible');
    });

    it('deve ter opcao padrao selecionada', () => {
      cy.get('.casa-select').should('exist');
    });
  });

  describe('Link GitHub', () => {
    beforeEach(() => {
      cy.viewport(1200, 800);
    });

    it('deve exibir o botao do GitHub no header', () => {
      cy.get('.github-btn').should('be.visible');
    });

    it('deve ter link correto para o repositorio', () => {
      cy.get('.github-btn')
        .should('have.attr', 'href', 'https://github.com/algoz098/quantomeupoliticogastou-ts')
        .and('have.attr', 'target', '_blank');
    });

    it('deve exibir tooltip ao passar o mouse', () => {
      cy.get('.github-btn').trigger('mouseenter');
      cy.contains('Ver no GitHub').should('be.visible');
    });
  });

  describe('Menu Mobile', () => {
    beforeEach(() => {
      cy.viewport(375, 667);
    });

    it('deve exibir botao de menu mobile', () => {
      cy.get('button[aria-label="Menu"]').should('be.visible');
    });

    it('deve abrir menu ao clicar', () => {
      cy.get('button[aria-label="Menu"]').click();
      cy.get('.mobile-menu').should('be.visible');
    });

    it('deve exibir links no menu mobile', () => {
      cy.get('button[aria-label="Menu"]').click();
      cy.get('.mobile-menu').within(() => {
        cy.contains('Dashboard').should('be.visible');
        cy.contains('Parlamentares').should('be.visible');
        cy.contains('Ranking').should('be.visible');
      });
    });

    it('deve navegar e fechar menu ao clicar em link', () => {
      cy.get('button[aria-label="Menu"]').click();
      cy.get('.mobile-menu').contains('Parlamentares').click();
      cy.url().should('include', '/parlamentares');
      cy.get('.mobile-menu').should('not.be.visible');
    });

    it('deve exibir link do GitHub no menu mobile', () => {
      cy.get('button[aria-label="Menu"]').click();
      cy.get('.mobile-menu').contains('GitHub').should('be.visible');
    });

    it('deve ter link correto do GitHub no menu mobile', () => {
      cy.get('button[aria-label="Menu"]').click();
      cy.get('.mobile-menu a[href="https://github.com/algoz098/quantomeupoliticogastou-ts"]')
        .should('exist')
        .and('have.attr', 'target', '_blank');
    });
  });

  describe('Responsividade', () => {
    it('deve adaptar layout para tablet', () => {
      cy.viewport(768, 1024);
      cy.get('.q-header').should('be.visible');
    });

    it('deve adaptar layout para mobile', () => {
      cy.viewport(375, 667);
      cy.get('.q-header').should('be.visible');
      cy.get('.nav-links').should('not.be.visible');
    });
  });
});

// Workaround for Cypress AE + TS + Vite
export {};

